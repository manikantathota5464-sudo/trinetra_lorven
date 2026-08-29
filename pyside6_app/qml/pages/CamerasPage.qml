import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
// import QtQuick.Effects 1.15  // not installed
import "../components"

Rectangle {
    id: root
    width: parent.width
    height: parent.height
    color: "#FAF8F5"
    // Simple toolbar with filters and register button (placeholder)
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 16
        // KPI cards row (using KpiCard)
        RowLayout {
            spacing: 16
            Repeater {
                model: backend.getCameraStats()
                delegate: KpiCard {
                    label: modelData.label
                    value: modelData.value
                    sub: modelData.sub
                    icon: modelData.icon
                    valueColor: modelData.color
                }
            }
        }
        // Toolbar card placeholder
        Rectangle {
            radius: 12
            color: "white"
            border.color: "#EDE5D8"
            height: 60
            Layout.fillWidth: true
            RowLayout {
                anchors.fill: parent
                anchors.margins: 12
                spacing: 8
                TextField { placeholderText: "Search cameras..." Layout.fillWidth: true }
                ComboBox { model: ["All", "Online", "Offline", "Maintenance"] }
                ComboBox { model: ["All", "Fixed", "PTZ", "Dome"] }
                Button { text: "+ Register Node" }
            }
        }
        // Table placeholder using ListView
        Rectangle {
            radius: 12
            color: "white"
            border.color: "#EDE5D8"
            Layout.fillWidth: true
            Layout.fillHeight: true
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 12
                // Header row
                RowLayout {
                    spacing: 8
                    Text { text: "ID"; font.bold: true; Layout.preferredWidth: 70 }
                    Text { text: "Location"; font.bold: true; Layout.preferredWidth: 150 }
                    Text { text: "Status"; font.bold: true; Layout.preferredWidth: 80 }
                    Text { text: "Type"; font.bold: true; Layout.preferredWidth: 80 }
                    Text { text: "Uptime"; font.bold: true; Layout.preferredWidth: 80 }
                    Text { text: "Last Seen"; font.bold: true; Layout.preferredWidth: 100 }
                    Text { text: "Sector"; font.bold: true; Layout.preferredWidth: 80 }
                }
                // Data rows
                ListView {
                    model: backend.getCameras()
                    clip: true
                    delegate: RowLayout {
                        spacing: 8
                        Text { text: modelData.id; Layout.preferredWidth: 70 }
                        Text { text: modelData.location; Layout.preferredWidth: 150 }
                        StatusBadge { text: modelData.status; status: modelData.status.toLowerCase() }
                        Text { text: modelData.type; Layout.preferredWidth: 80 }
                        Text { text: modelData.uptime + "%"; Layout.preferredWidth: 80 }
                        Text { text: modelData.lastSeen; Layout.preferredWidth: 100 }
                        Text { text: modelData.sector; Layout.preferredWidth: 80 }
                        // Action button placeholder
                        Button { text: "View"; Layout.preferredWidth: 60 }
                    }
                }
            }
        }
    }
}
