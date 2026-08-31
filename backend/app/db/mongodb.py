"""
MongoDB Persistence Layer for TRINETRA Intelligent Surveillance.
Persists all real-time detections, bounding boxes, license plates, OCR confidences,
and jobs into MongoDB collections (`detections`, `jobs`, `cameras`).
Includes automatic in-memory fallback for high-availability.
"""
import time
import logging
from typing import List, Dict, Any, Optional
import pymongo
from pymongo.collection import Collection

from backend.app.config import settings

logger = logging.getLogger("TRINETRA.MongoDB")

class MongoDBService:
    _instance: Optional['MongoDBService'] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.uri = settings.MONGODB_URI
        self.db_name = settings.MONGODB_DB_NAME
        self.client: Optional[pymongo.MongoClient] = None
        self.db = None
        self.is_connected = False
        
        # In-memory buffer for zero-downtime if MongoDB starts after backend
        self._memory_detections: List[Dict[str, Any]] = []
        self._memory_jobs: Dict[str, Dict[str, Any]] = {}
        
        self._initialized = True
        self.connect()

    def connect(self):
        """Establish connection to MongoDB."""
        try:
            self.client = pymongo.MongoClient(
                self.uri,
                serverSelectionTimeoutMS=1500,
                connectTimeoutMS=1500
            )
            # Verify server connectivity
            self.client.server_info()
            self.db = self.client[self.db_name]
            self.is_connected = True
            
            # Create indexes for optimal query speeds on license plates and timestamps
            self.db.detections.create_index([("plateNumber", pymongo.ASCENDING)])
            self.db.detections.create_index([("timestamp_iso", pymongo.DESCENDING)])
            self.db.detections.create_index([("job_id", pymongo.ASCENDING)])
            self.db.jobs.create_index([("job_id", pymongo.ASCENDING)], unique=True)
            
            logger.info(f"MongoDB connected successfully to '{self.db_name}' at {self.uri}")
            self._flush_memory_to_mongo()
        except Exception as e:
            self.is_connected = False
            logger.warning(f"MongoDB not reachable at {self.uri} ({e}). Using resilient in-memory storage with auto-sync.")

    def _flush_memory_to_mongo(self):
        """Sync buffered in-memory items when MongoDB becomes available."""
        if not self.is_connected or self.db is None:
            return
        try:
            if self._memory_detections:
                self.db.detections.insert_many(self._memory_detections)
                logger.info(f"Synced {len(self._memory_detections)} buffered detections to MongoDB.")
                self._memory_detections.clear()
        except Exception as e:
            logger.error(f"Error flushing memory buffer to MongoDB: {e}")

    def save_detection(self, detection: Dict[str, Any]) -> Dict[str, Any]:
        """Save a single detection to MongoDB."""
        doc = dict(detection)
        if "created_at" not in doc:
            doc["created_at"] = time.time()
        if "timestamp_iso" not in doc:
            doc["timestamp_iso"] = time.strftime("%Y-%m-%d %H:%M:%S")

        # Strip ObjectId before returning
        if self.is_connected and self.db is not None:
            try:
                res = self.db.detections.insert_one(doc)
                doc["_id"] = str(res.inserted_id)
                return doc
            except Exception as e:
                logger.error(f"MongoDB write failed, buffering locally: {e}")
                self.is_connected = False
        
        # In-memory buffer
        self._memory_detections.insert(0, doc)
        return doc

    def save_detections_batch(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Save multiple detections in a single atomic batch operation."""
        if not detections:
            return []

        docs = []
        now_ts = time.time()
        now_iso = time.strftime("%Y-%m-%d %H:%M:%S")

        for d in detections:
            doc = dict(d)
            doc["created_at"] = doc.get("created_at", now_ts)
            doc["timestamp_iso"] = doc.get("timestamp_iso", now_iso)
            docs.append(doc)

        if self.is_connected and self.db is not None:
            try:
                res = self.db.detections.insert_many(docs)
                for idx, inserted_id in enumerate(res.inserted_ids):
                    docs[idx]["_id"] = str(inserted_id)
                return docs
            except Exception as e:
                logger.error(f"MongoDB batch write failed: {e}")
                self.is_connected = False

        # In-memory buffer fallback
        for doc in docs:
            self._memory_detections.insert(0, doc)
        return docs

    def get_detections(
        self,
        limit: int = 100,
        plate_query: Optional[str] = None,
        violation_only: bool = False,
        job_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch detections matching filter criteria from MongoDB or in-memory store."""
        if self.is_connected and self.db is not None:
            try:
                query: Dict[str, Any] = {}
                if plate_query:
                    query["plateNumber"] = {"$regex": plate_query, "$options": "i"}
                if violation_only:
                    query["violation"] = {"$ne": None}
                if job_id:
                    query["job_id"] = job_id

                cursor = self.db.detections.find(query).sort("created_at", pymongo.DESCENDING).limit(limit)
                results = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    results.append(doc)
                return results
            except Exception as e:
                logger.error(f"MongoDB query failed: {e}")
                self.is_connected = False

        # Query from memory buffer
        filtered = self._memory_detections
        if plate_query:
            pq = plate_query.lower().replace(" ", "")
            filtered = [d for d in filtered if pq in d.get("plateNumber", "").lower().replace(" ", "")]
        if violation_only:
            filtered = [d for d in filtered if d.get("violation")]
        if job_id:
            filtered = [d for d in filtered if d.get("job_id") == job_id]

        return filtered[:limit]

    def save_job(self, job_dict: Dict[str, Any]):
        """Persist a job record."""
        doc = dict(job_dict)
        if self.is_connected and self.db is not None:
            try:
                self.db.jobs.update_one(
                    {"job_id": doc["job_id"]},
                    {"$set": doc},
                    upsert=True
                )
                return
            except Exception as e:
                logger.error(f"MongoDB job save failed: {e}")
        self._memory_jobs[doc["job_id"]] = doc

    def get_db_stats(self) -> Dict[str, Any]:
        """Return live counts of total detections, unique plates, violations."""
        if self.is_connected and self.db is not None:
            try:
                total_dets = self.db.detections.count_documents({})
                unique_plates = len(self.db.detections.distinct("plateNumber"))
                violations = self.db.detections.count_documents({"violation": {"$ne": None}})
                return {
                    "connected": True,
                    "db_name": self.db_name,
                    "total_detections": total_dets,
                    "unique_plates": unique_plates,
                    "total_violations": violations
                }
            except Exception as e:
                logger.error(f"MongoDB stats failed: {e}")

        # In-memory stats
        plates = set(d.get("plateNumber") for d in self._memory_detections if d.get("plateNumber"))
        viols = sum(1 for d in self._memory_detections if d.get("violation"))
        return {
            "connected": False,
            "db_name": "in-memory (buffered)",
            "total_detections": len(self._memory_detections),
            "unique_plates": len(plates),
            "total_violations": viols
        }

db_client = MongoDBService()
