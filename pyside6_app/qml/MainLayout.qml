import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
// import QtQuick.Effects 1.15  // not installed
import "components"

Rectangle {
    id: root
    width: parent.width
    height: parent.height
    color: "#FAF8F5"
    // Header
    Rectangle {
        id: header
        height: 68
        width: parent.width
        color: "#FAF7F0"
        border.color: "#EDE5D8"
        border.width: 1
        RowLayout {
            anchors.fill: parent
            anchors.margins: 12
            spacing: 16
            // Left branding
            RowLayout {
                spacing: 8
                Image {
                    source: assetsPath + "/emblem_clean_no_black.png"
                    width: 40
                    height: 40
                    fillMode: Image.PreserveAspectFit
                }
                ColumnLayout {
                    spacing: 2
                    Text { text: "Ministry of Road Transport & Highways"; font.pixelSize: 12; color: "#334155" }
                    Text { text: "TRINETHRA"; font.pixelSize: 16; font.bold: true; color: "#0C2540" }
                }
            }
            // Right side controls (clock, notifications, profile)
            RowLayout {
                Layout.alignment: Qt.AlignRight
                spacing: 12
                // Clock
                ColumnLayout {
                    Text { id: timeText; text: "--:--:--"; font.pixelSize: 14; color: "#0C2540" }
                    Text { id: dateText; text: "---"; font.pixelSize: 10; color: "#64748B" }
                }
                // Notification bell placeholder
                Button {
                    text: "🔔"
                    background: Rectangle { color: "transparent" }
                }
                // Profile
                Button {
                    text: "👤 Admin"
                    background: Rectangle { color: "transparent" }
                }
            }
        }
    }
    // Ticker bar
    Rectangle {
        id: ticker
        y: header.height
        height: 30
        width: parent.width
        color: "#0B1E33"
        RowLayout {
            anchors.fill: parent
            anchors.margins: 8
            spacing: 8
            Text { text: "SYSTEM ADVISORY"; color: "#F87171"; font.pixelSize: 10 }
            Text {
                text: "Heavy congestion on I-9 Overpass. Traffic advisory active. Stay Safe, Follow Rules."
                color: "white"
                font.pixelSize: 10
                elide: Text.ElideRight
                Layout.fillWidth: true
            }
            Text { text: "● Grid: 99.8% Sync"; color: "#10B981"; font.pixelSize: 10 }
        }
    }
    // Body layout
    RowLayout {
        anchors.top: ticker.bottom
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        // Sidebar
        Rectangle {
            id: sidebar
            width: 235
            color: "white"
            border.color: "#EDE5D8"
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 12
                spacing: 8
                Text { text: "MAIN NAVIGATION"; font.pixelSize: 9; color: "#94A3B8"; textTransform: Text.AllUppercase }
                // Nav buttons (example few)
                NavButton { label: "Dashboard"; icon: "🏠"; route: "dashboard"; active: backend.currentRoute === "dashboard"; onClicked: backend.navigate("dashboard") }
                NavButton { label: "Cameras"; icon: "📹"; route: "cameras"; active: backend.currentRoute === "cameras"; onClicked: backend.navigate("cameras") }
                NavButton { label: "Live Feeds"; icon: "📺"; route: "livefeeds"; active: backend.currentRoute === "livefeeds"; onClicked: backend.navigate("livefeeds") }
                NavButton { label: "Alerts"; icon: "⚠️"; route: "alerts"; badge: "21"; active: backend.currentRoute === "alerts"; onClicked: backend.navigate("alerts") }
                NavButton { label: "Watchlist"; icon: "📋"; route: "watchlist"; active: backend.currentRoute === "watchlist"; onClicked: backend.navigate("watchlist") }
                // stretch space
                Item { Layout.fillHeight: true }
                // Footer card
                Rectangle {
                    height: 80
                    radius: 12
                    color: "#FAF8F5"
                    border.color: "#EDE5D8"
                    Image {
                        source: assetsPath + "/emblem_clean_no_black.png"
                        anchors.centerIn: parent
                        width: 48
                        height: 48
                    }
                }
            }
        }
        // Main content loader
        Loader {
            id: pageLoader
            Layout.fillWidth: true
            Layout.fillHeight: true
            source: "pages/DashboardPage.qml"
            Connections {
                target: backend
                function onNavigationChanged(route) {
                    var page = route.charAt(0).toUpperCase() + route.slice(1) + "Page.qml"
                    pageLoader.source = "pages/" + page
                }
            }
        }
    }
}
