import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
// import QtQuick.Effects 1.15  // not installed

Rectangle {
    id: root
    property string label: ""
    property string route: ""
    property string icon: ""
    property bool active: false
    property string badge: ""
    signal clicked()
    width: parent.width
    height: 38
    radius: 4
    color: root.active ? "#0C2540" : "transparent"
    border.width: 0
    RowLayout {
        anchors.fill: parent
        anchors.margins: 8
        spacing: 8
        // Icon
        Text {
            id: iconText
            text: root.icon
            font.pixelSize: 16
            color: root.active ? "white" : "#334155"
            visible: root.icon !== ""
        }
        // Label
        Text {
            id: labelText
            text: root.label
            font.pixelSize: 14
            color: root.active ? "white" : "#334155"
            Layout.fillWidth: true
        }
        // Badge (optional)
        Rectangle {
            id: badgeRect
            visible: root.badge.length > 0
            height: 20
            radius: 10
            color: root.active ? "#fff" : "#DC2626"
            Text {
                anchors.centerIn: parent
                text: root.badge
                font.pixelSize: 10
                color: root.active ? "#0C2540" : "white"
            }
        }
    }
    MouseArea {
        anchors.fill: parent
        hoverEnabled: true
        onClicked: root.clicked()
        cursorShape: Qt.PointingHandCursor
        // Hover effect when inactive
        Rectangle {
            anchors.fill: parent
            color: (root.active || !containsMouse) ? "transparent" : "#F1F5F9"
            z: -1
        }
    }
}
