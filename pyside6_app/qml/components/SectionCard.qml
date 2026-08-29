import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
// import QtQuick.Effects 1.15  // not installed

Rectangle {
    id: root
    property alias content: container.data
    property string title: ""
    width: parent ? parent.width : 400
    radius: 12
    color: "white"
    border.color: "#EDE5D8"
    border.width: 1
    ColumnLayout {
        id: container
        anchors.fill: parent
        anchors.margins: 16
        spacing: 8
        // Optional title
        Text {
            id: titleText
            text: root.title
            font.pixelSize: 10
            color: "#94A3B8"
            textTransform: Text.AllUppercase
            visible: root.title.length > 0
        }
        // Content placeholder (will be filled by children)
        Item {
            id: contentHolder
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
