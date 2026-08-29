import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtQuick.Effects 1.15

Rectangle {
    id: root
    property string text: ""
    property string status: "default" // active,offline,maintenance,critical,warning,resolved,new,stolen,cloned
    width: implicitWidth
    height: 20
    radius: 10
    color: {
        switch (root.status) {
            case "active": return "#059669";
            case "offline": return "#DC2626";
            case "maintenance": return "#D97706";
            case "critical": return "#DC2626";
            case "warning": return "#D97706";
            case "resolved": return "#059669";
            case "new": return "#2563EB";
            case "stolen": return "#7C3AED";
            case "cloned": return "#7C3AED";
            default: return "#64748B";
        }
    }
    Text {
        anchors.centerIn: parent
        text: root.text
        font.pixelSize: 10
        color: "white"
    }
    // Shadow for depth
    layer.enabled: true
    layer.effect: DropShadow { verticalOffset: 1; radius: 4; color: "#15000000"; samples: 12 }
}
