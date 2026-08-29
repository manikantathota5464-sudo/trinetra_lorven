import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
// import QtQuick.Effects 1.15  // removed because module not installed

Rectangle {
    id: root
    width: parent.width
    height: parent.height
    color: "#0C2540"
    signal loginSuccess()

    RowLayout {
        anchors.fill: parent
        anchors.margins: 40
        spacing: 20
        // Left panel with emblem and branding
        ColumnLayout {
            spacing: 12
            Image {
                source: assetsPath + "/emblem_clean_no_black.png"
                fillMode: Image.PreserveAspectFit
                width: 150
                height: 150
            }
            Text {
                text: "TRINETHRA"
                font.pixelSize: 28
                font.bold: true
                color: "white"
            }
            Text {
                text: "Intelligent Traffic Monitoring & Enforcement"
                font.pixelSize: 14
                color: "#F1F5F9"
            }
        }
        // Right white card with login form
        Rectangle {
            id: card
            Layout.fillWidth: true
            Layout.preferredHeight: 400
            radius: 20
            color: "white"
            border.color: "#EDE5D8"
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 24
                spacing: 16
                Text {
                    text: "Sign In"
                    font.pixelSize: 24
                    font.bold: true
                    color: "#0C2540"
                }
                TextField {
                    id: userField
                    placeholderText: "Username"
                    font.pixelSize: 14
                    width: parent.width
                }
                RowLayout {
                    width: parent.width
                    TextField {
                        id: passField
                        placeholderText: "Password"
                        echoMode: TextInput.Password
                        font.pixelSize: 14
                        Layout.fillWidth: true
                    }
                    ToolButton {
                        icon.source: "qrc:/icons/eye.png" // placeholder, ignore if missing
                        onClicked: passField.echoMode = passField.echoMode === TextInput.Password ? TextInput.Normal : TextInput.Password
                    }
                }
                CheckBox {
                    text: "Remember Me"
                }
                Button {
                    text: "Sign In"
                    width: parent.width
                    height: 40
                    background: Rectangle {
                        color: "#0C2540"
                        radius: 6
                    }
                    contentItem: Text {
                        text: parent.text
                        color: "white"
                        font.pixelSize: 14
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                    }
                    onClicked: {
                        if (userField.text.length > 0) {
                            root.loginSuccess()
                        }
                    }
                }
                Item { Layout.fillHeight: true }
                RowLayout {
                    spacing: 12
                    Text { text: "Helpline:"; color: "#64748B"; font.pixelSize: 12 }
                    Text { text: "1033"; color: "#0C2540"; font.pixelSize: 12; font.bold: true }
                }
            }
        }
    }
    // When login succeeds, tell backend to navigate to dashboard
    Connections {
        target: root
        function onLoginSuccess() { backend.navigate("dashboard") }
    }
}
