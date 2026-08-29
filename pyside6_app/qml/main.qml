import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtQuick.Window 2.15

ApplicationWindow {
    id: appWindow
    visible: true
    width: 1380
    height: 880
    minimumWidth: 1100
    minimumHeight: 720
    title: "TRINETHRA — Ministry of Road Transport & Highways"
    color: "#FAF8F5"

    // Loader to manage navigation between pages
    Loader {
        id: pageLoader
        anchors.fill: parent
        source: "LoginPage.qml"
    }

    // Update page based on backend navigation signal
    Connections {
        target: backend
        function onNavigationChanged(route) {
            var pageUrl = "pages/" + route.charAt(0).toUpperCase() + route.slice(1) + "Page.qml"
            pageLoader.source = pageUrl
        }
    }
}
