// This example uses an ESP32 Development Board
// to connect to shiftr.io.
//
// You can check on your device after a successful
// connection here: https://www.shiftr.io/try.
//
// by Joël Gähwiler
// https://github.com/256dpi/arduino-mqtt
#define ONBOARD_LED  2
#define VAR_Y_IN 32
#define VAR_X_IN 35
#define BTTN 34
#include <WiFi.h>
#include <MQTT.h>


WiFiClient net;
MQTTClient client;
unsigned long lastMillis = 0;
int lastSignalSend = 0;

void connect() {
  Serial.print("checking wifi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.print("\nconnecting...");
  while (!client.connect("arduino", "public", "public")) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("\nconnected!");
  client.subscribe("ponggame");
  // client.unsubscribe("/hello");
}
void messageReceived(String &topic, String &payload) {
  // Serial.println("incoming: " + topic + " - " + payload);
  if (topic.equals("ponggame") && payload.equals("on"))
  {
    digitalWrite(ONBOARD_LED, HIGH);
  }
  // Note: Do not use the client in the callback to publish, subscribe or
  // unsubscribe as it may cause deadlocks when other things arrive while
  // sending and receiving acknowledgments. Instead, change a global variable,
  // or push to a queue and handle it in the loop after calling client.loop().
}

void setup() {
  Serial.begin(9600);
  WiFi.begin("WiFi name", "WiFi password");
  // Note: Local domain names (e.g. "Computer.local" on OSX) are not supported
  // by Arduino. You need to set the IP address directly.
  client.begin("public.cloud.shiftr.io", net);
  client.onMessage(messageReceived);
  pinMode(ONBOARD_LED, OUTPUT);
  pinMode(BTTN, INPUT_PULLUP); //SW
  pinMode(VAR_Y_IN, INPUT_PULLUP); //varY
  pinMode(VAR_X_IN, INPUT_PULLUP); //varx
  connect();
  int button_bool;
}

void loop() {
  client.loop();
  delay(10);  // <- fixes some issues with WiFi stability
  if (!client.connected()) {
    connect();
  }
  if(millis() - lastSignalSend > 100){
    if(analogRead(VAR_X_IN) >3000){
      Serial.print("var X: ");
      Serial.println(analogRead(VAR_X_IN));
      client.publish("/idseplayer2", String(-2));
    }
    if(analogRead(VAR_X_IN)< 1000){
      Serial.print("var X: ");
      Serial.println(analogRead(VAR_X_IN));
      client.publish("/idseplayer2", String(2));
    }
  }
}
