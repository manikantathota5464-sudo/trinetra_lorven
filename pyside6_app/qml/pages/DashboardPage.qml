import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
// import QtQuick.Effects 1.15  // not installed
import "../components"

Rectangle {
    id: root
    width: parent.width
    height: parent.height
    color: "transparent"

    ScrollView {
        anchors.fill: parent
        contentItem: ColumnLayout {
            spacing: 16
            anchors.margins: 20
            // Row 1: KPI cards
            RowLayout {
                spacing: 16
                KpiCard {
                    label: "TOTAL CAMERAS"
                    value: "1,284"
                    sub: "+6.2% vs 24h"
                    icon: "📹"
                    valueColor: "#0C2540"
                }
                KpiCard {
                    label: "ACTIVE CAMERAS"
                    value: "1,042"
                    sub: "81% of total"
                    icon: "⚡"
                    valueColor: "#0C2540"
                    showProgress: true
                    progressValue: 81
                    badge: "Online"
                }
                KpiCard {
                    label: "ACTIVE ALERTS"
                    value: "21"
                    sub: "Immediate attention"
                    icon: "⚠️"
                    valueColor: "#DC2626"
                }
                KpiCard {
                    label: "TOTAL DETECTIONS"
                    value: "12,846"
                    sub: "+8.4% 24h"
                    icon: "📊"
                    valueColor: "#0C2540"
                }
            }
            // Row 2: 3-column grid
            RowLayout {
                spacing: 16
                // Column 1: Recent Detections
                SectionCard {
                    title: "RECENT DETECTIONS"
                    Layout.preferredWidth: parent.width * 0.33
                    ColumnLayout {
                        spacing: 8
                        Repeater {
                            model: backend.getRecentDetections()
                            delegate: RowLayout {
                                spacing: 8
                                Rectangle { // placeholder car thumbnail
                                    width: 40
                                    height: 32
                                    radius: 6
                                    color: "#F1F5F9"
                                }
                                Text { text: modelData.plate; font.pixelSize: 12; font.bold: true }
                                Text { text: modelData.vehicle; font.pixelSize: 12; color: "#64748B" }
                                Text { text: modelData.confidence + "%"; font.pixelSize: 12; color: "#059669" }
                                Text { text: modelData.timestamp; font.pixelSize: 10; color: "#94A3B8" }
                            }
                        }
                    }
                }
                // Column 2: Alerts Overview (simplified)
                SectionCard {
                    title: "ALERTS OVERVIEW"
                    Layout.preferredWidth: parent.width * 0.33
                    ColumnLayout {
                        spacing: 8
                        Repeater {
                            model: [{"type":"Critical","count":8,"color":"#DC2626"},{"type":"Warning","count":13,"color":"#D97706"},{"type":"Resolved","count":18,"color":"#059669"}]
                            delegate: RowLayout {
                                spacing: 8
                                Rectangle { width: 4; height: 20; color: modelData.color }
                                Text { text: modelData.type; font.pixelSize: 12; color: "#334155" }
                                Text { text: modelData.count; font.pixelSize: 12; font.bold: true; color: "#0C2540" }
                            }
                        }
                    }
                }
                // Column 3: Live Map placeholder
                SectionCard {
                    title: "LIVE MAP"
                    Layout.preferredWidth: parent.width * 0.34
                    Rectangle {
                        width: parent.width - 32
                        height: 250
                        color: "#E5E7EB"
                        Text { anchors.centerIn: parent; text: "Map Canvas (to be implemented)"; color: "#64748B" }
                    }
                }
            }
            // Row 3: Activity Timeline (simplified cards)
            RowLayout {
                spacing: 12
                Repeater {
                    model: backend.getActivityTimeline()
                    delegate: SectionCard {
                        Layout.preferredWidth: parent.width * 0.24
                        title: ""
                        ColumnLayout {
                            spacing: 4
                            Rectangle {
                                height: 4
                                width: parent.width
                                color: {
                                    switch (modelData.severity) {
                                        case "Critical": return "#DC2626";
                                        case "Warning": return "#D97706";
                                        case "Resolved": return "#059669";
                                        default: return "#2563EB";
                                    }
                                }
                            }
                            Text { text: modelData.timestamp; font.pixelSize: 10; color: "#94A3B8" }
                            Text { text: modelData.description; font.pixelSize: 12; color: "#1E293B"; wrapMode: Text.Wrap }
                            Text { text: "Operator: " + modelData.operator; font.pixelSize: 10; color: "#64748B" }
                        }
                    }
                }
            }
        }
    }
}
