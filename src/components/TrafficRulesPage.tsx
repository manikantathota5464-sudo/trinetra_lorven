import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Car, 
  Truck, 
  Bike, 
  FileText, 
  Calculator, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Info,
  Scale
} from 'lucide-react';

interface RuleItem {
  id: string;
  section: string;
  title: string;
  category: 'Speed' | 'Safety' | 'Signal' | 'Documents' | 'Commercial';
  description: string;
  fineFirst: string;
  fineSecond: string;
  demeritPoints: number;
  vehicleTypes: string[];
}

export const TrafficRulesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');
  
  // Interactive Calculator State
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [calculatorVehicle, setCalculatorVehicle] = useState<'Car' | 'Bike' | 'Commercial'>('Car');

  const rulesData: RuleItem[] = [
    {
      id: 'R-101',
      section: 'Section 183(1)',
      title: 'Overspeeding (Exceeding Limit by >20 km/h)',
      category: 'Speed',
      description: 'Driving at speed exceeding the prescribed limit on designated national highways or expressways.',
      fineFirst: '₹2,000 (LMV) / ₹4,000 (HMV)',
      fineSecond: '₹4,000 + License Suspension',
      demeritPoints: 3,
      vehicleTypes: ['Car', 'Commercial', 'Bike']
    },
    {
      id: 'R-102',
      section: 'Section 184',
      title: 'Dangerous Driving & Jumping Red Light',
      category: 'Signal',
      description: 'Crossing stop line during red signal phase or weaving erratically across lanes creating hazard.',
      fineFirst: '₹5,000',
      fineSecond: '₹10,000 + 6 Months Imprisonment',
      demeritPoints: 4,
      vehicleTypes: ['Car', 'Commercial', 'Bike']
    },
    {
      id: 'R-103',
      section: 'Section 194B',
      title: 'Not Wearing Seatbelt (Driver & Passengers)',
      category: 'Safety',
      description: 'Operating passenger vehicle without mandatory 3-point seatbelt fastened for front and rear occupants.',
      fineFirst: '₹1,000',
      fineSecond: '₹1,000 per violation',
      demeritPoints: 1,
      vehicleTypes: ['Car', 'Commercial']
    },
    {
      id: 'R-104',
      section: 'Section 194D',
      title: 'Riding Without BIS Approved Helmet',
      category: 'Safety',
      description: 'Operating two-wheeler without standard ISI/BIS certified safety helmet for rider or pillion.',
      fineFirst: '₹1,000 + 3 Months License Disqualification',
      fineSecond: '₹1,000 + Impoundment',
      demeritPoints: 2,
      vehicleTypes: ['Bike']
    },
    {
      id: 'R-105',
      section: 'Section 194E',
      title: 'Blocking Emergency Vehicles (Ambulance / Fire)',
      category: 'Safety',
      description: 'Failure to pull over to left side and yield right of way to approaching emergency sirens.',
      fineFirst: '₹10,000 + Up to 6 Months Imprisonment',
      fineSecond: '₹10,000 + Compounding Court Notice',
      demeritPoints: 5,
      vehicleTypes: ['Car', 'Commercial', 'Bike']
    },
    {
      id: 'R-106',
      section: 'Section 185',
      title: 'Driving Under Influence of Alcohol / Narcotics',
      category: 'Safety',
      description: 'Blood Alcohol Content (BAC) exceeding 30mg per 100ml of blood detected via breath analyzer.',
      fineFirst: '₹10,000 and/or 6 Months Jail',
      fineSecond: '₹15,000 and/or 2 Years Jail',
      demeritPoints: 6,
      vehicleTypes: ['Car', 'Commercial', 'Bike']
    },
    {
      id: 'R-107',
      section: 'Section 181',
      title: 'Driving Without Valid Driving License',
      category: 'Documents',
      description: 'Operating motor vehicle without possessing an active, category-appropriate driving license.',
      fineFirst: '₹5,000',
      fineSecond: '₹5,000 + Vehicle Seizure',
      demeritPoints: 3,
      vehicleTypes: ['Car', 'Commercial', 'Bike']
    },
    {
      id: 'R-108',
      section: 'Section 194A',
      title: 'Overloading Passenger Capacity / Pillion Riding',
      category: 'Commercial',
      description: 'Carrying more passengers than permitted in registration certificate or triple riding on two-wheeler.',
      fineFirst: '₹1,000 per excess passenger',
      fineSecond: '₹1,000 per passenger + Permit Review',
      demeritPoints: 2,
      vehicleTypes: ['Car', 'Commercial', 'Bike']
    },
    {
      id: 'R-109',
      section: 'Section 190(2)',
      title: 'Using Mobile Phone While Driving',
      category: 'Safety',
      description: 'Holding or operating handheld telecommunication devices while in motion or stationary in traffic lane.',
      fineFirst: '₹5,000',
      fineSecond: '₹10,000',
      demeritPoints: 3,
      vehicleTypes: ['Car', 'Commercial', 'Bike']
    },
    {
      id: 'R-110',
      section: 'Section 192A',
      title: 'Operating Without Fitness / Valid PUC Certificate',
      category: 'Documents',
      description: 'Vehicle operating without updated Pollution Under Control (PUC) certificate or commercial fitness.',
      fineFirst: '₹10,000',
      fineSecond: '₹10,000 + RC Suspension',
      demeritPoints: 2,
      vehicleTypes: ['Car', 'Commercial', 'Bike']
    }
  ];

  const filteredRules = rulesData.filter(rule => {
    const matchesSearch = 
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || rule.category === selectedCategory;
    const matchesVehicle = selectedVehicle === 'All' || rule.vehicleTypes.includes(selectedVehicle);

    return matchesSearch && matchesCategory && matchesVehicle;
  });

  const toggleCalculatorViolation = (id: string) => {
    setSelectedViolations(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const calculateTotalEstimatedFine = () => {
    return selectedViolations.reduce((total, id) => {
      const item = rulesData.find(r => r.id === id);
      if (!item) return total;
      // Extract numeric fine approximation
      const match = item.fineFirst.match(/₹([0-9,]+)/);
      const val = match ? parseInt(match[1].replace(/,/g, ''), 10) : 1000;
      return total + val;
    }, 0);
  };

  const calculateTotalDemerit = () => {
    return selectedViolations.reduce((total, id) => {
      const item = rulesData.find(r => r.id === id);
      return total + (item ? item.demeritPoints : 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#F4EFE6] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#0C2540] font-black text-xs uppercase tracking-wider mb-1">
            <BookOpen size={16} />
            <span>Official Regulatory Handbook</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Traffic Rules, Penalties &amp; Safety Guidelines
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            As mandated by the Ministry of Road Transport &amp; Highways under Motor Vehicles Act (Amendment).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF8F5] p-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
          <Scale size={16} className="text-[#0C2540]" />
          <span>Active Statutory Code: MVA 2026/Rev.4</span>
        </div>
      </div>

      {/* Main Grid: Rules List + Dynamic Fine Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left 8 Cols: Search, Filters & Rules Catalog */}
        <div className="lg:col-span-8 space-y-4">

          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-[#F4EFE6] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by rule, section (e.g. 184, overspeeding, helmet)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0C2540]"
                />
              </div>

              {/* Vehicle Type Filter */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs font-bold">
                {['All', 'Car', 'Bike', 'Commercial'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVehicle(v)}
                    className={`px-2.5 py-1 rounded ${
                      selectedVehicle === v
                        ? 'bg-[#0C2540] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['All', 'Speed', 'Safety', 'Signal', 'Documents', 'Commercial'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0C2540] text-white border-[#0C2540]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rules Cards List */}
          <div className="space-y-3">
            {filteredRules.map((rule) => {
              const isSelected = selectedViolations.includes(rule.id);
              return (
                <div
                  key={rule.id}
                  className={`bg-white rounded-xl p-4 border transition-all ${
                    isSelected ? 'border-[#0C2540] ring-1 ring-[#0C2540] shadow-md' : 'border-[#F4EFE6] hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-[#0C2540] px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        {rule.section}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        ID: {rule.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        {rule.demeritPoints} Demerit Pts
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCalculatorViolation(rule.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                          isSelected 
                            ? 'bg-[#0C2540] text-white border-[#0C2540]' 
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ In Calculator' : '+ Add to Calculator'}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mb-3">
                    {rule.description}
                  </p>

                  {/* Fines Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FAF8F5] p-2.5 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">First Offense Fine</span>
                      <span className="font-extrabold text-slate-800">{rule.fineFirst}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Subsequent Offense</span>
                      <span className="font-extrabold text-red-600">{rule.fineSecond}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRules.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-300">
                No traffic rules matched your search criteria. Try clearing filters.
              </div>
            )}
          </div>

        </div>

        {/* Right 4 Cols: Dynamic Interactive Fine Calculator & Speed Limits */}
        <div className="lg:col-span-4 space-y-4">

          {/* Dynamic Fine Calculator Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#F4EFE6] shadow-md space-y-4 sticky top-20">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="bg-[#0C2540] p-1.5 rounded-lg text-white">
                <Calculator size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-none">
                  Dynamic Penalty Calculator
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">Instant fine &amp; demerit estimate</span>
              </div>
            </div>

            {/* Vehicle Selector */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                Vehicle Category
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {(['Car', 'Bike', 'Commercial'] as const).map((vt) => (
                  <button
                    key={vt}
                    onClick={() => setCalculatorVehicle(vt)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition ${
                      calculatorVehicle === vt
                        ? 'bg-[#0C2540] text-white border-[#0C2540]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Items count */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Selected Violations:</span>
                <span className="font-bold text-slate-900">{selectedViolations.length} items</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Accumulated Demerit:</span>
                <span className={`font-bold ${calculateTotalDemerit() >= 6 ? 'text-red-600' : 'text-orange-600'}`}>
                  {calculateTotalDemerit()} / 12 Pts
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 uppercase">Estimated Total Fine:</span>
                <span className="text-lg font-black text-[#0C2540]">
                  ₹{calculateTotalEstimatedFine().toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedViolations.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedViolations.map((vid) => {
                  const r = rulesData.find(x => x.id === vid);
                  if (!r) return null;
                  return (
                    <div key={vid} className="flex justify-between items-center text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="truncate pr-2 font-medium text-slate-700">{r.title}</span>
                      <button
                        onClick={() => toggleCalculatorViolation(vid)}
                        className="text-red-500 hover:text-red-700 font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedViolations.length > 0 && (
              <button
                onClick={() => setSelectedViolations([])}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
              >
                Clear All Selected
              </button>
            )}

            {/* Standard Speed Limits Reference Table */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Statutory Speed Limits (km/h)
              </h4>
              <div className="text-[11px] space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Expressways (NE/Exp):</span>
                  <span className="font-bold text-[#0C2540]">120 km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">4-Lane National Highways:</span>
                  <span className="font-bold text-[#0C2540]">100 km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Urban Arterial Roads:</span>
                  <span className="font-bold text-[#0C2540]">70 km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">School &amp; Hospital Zones:</span>
                  <span className="font-bold text-red-600">25 km/h</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
