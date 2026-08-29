import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
// import QtQuick.Effects 1.15  // not installed

Rectangle {
    id: root
    property alias label: labelText.text
    property alias value: valueText.text
    property alias sub: subText.text
    property string valueColor: "#0C2540"
    property string icon: ""
    property bool showProgress: false
    property int progressValue: 0
    property string badge: ""
    width: 240
    height: 120
    radius: 14
    color: "white"
    border.color: "#EDE5D8"
    border.width: 1

    RowLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 8
        // Icon square
        Rectangle {
            id: iconRect
            width: 36
            height: 36
            radius: 8
            color: "#EFF6FF"
            visible: root.icon !== ""
            Text {
                anchors.centerIn: parent
                text: root.icon
                font.pixelSize: 18
            }
        }
        ColumnLayout {
            Layout.fillWidth: true
            spacing: 2
            Text {
                id: labelText
                text: ""
                font.pixelSize: 10
                color: "#94A3B8"
                textTransform: Text.AllUppercase
                letterSpacing: 1.2
            }
            Text {
                id: valueText
                text: ""
                font.pixelSize: 28
                font.bold: true
                color: root.valueColor
            }
            Text {
                id: subText
                text: ""
                font.pixelSize: 10
                color: "#64748B"
                visible: root.sub.length > 0
            }
            // Progress bar
            Rectangle {
                id: progressBarBg
                visible: root.showProgress
                height: 4
                radius: 2
                color: "#E2E8F0"
                Layout.fillWidth: true
                Rectangle {
                    anchors.left: parent.left
                    anchors.verticalCenter: parent.verticalCenter
                    height: parent.height
                    width: parent.width * Math.min(root.progressValue/100, 1)
                    radius: 2
                    color: "#059669"
                }
            }
            // Badge
            Rectangle {
                id: badgeRect
                visible: root.badge.length > 0
                height: 20
                radius: 10
                color: "#059669"
                Layout.alignment: Qt.AlignLeft
                Text {
                    anchors.centerIn: parent
                    text: root.badge
                    font.pixelSize: 10
                    color: "white"
                }
                anchors.topMargin: 4
                Layout.topMargin: 4
            }
        }
    }
}
