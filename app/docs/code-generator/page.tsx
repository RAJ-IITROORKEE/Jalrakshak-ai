import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  CheckCircle,
  Download,
  AlertCircle,
  Info,
  Package,
  Radio,
  Webhook
} from "lucide-react";
import { ArduinoCodeGen } from "@/components/arduino-code-gen";

export const metadata = {
  title: "Code Generator - JalRakshak.AI Documentation",
  description: "Generate custom Arduino code for your JalRakshak.AI water quality monitoring device with TTN credentials.",
};

export default function CodeGeneratorPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Code2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Arduino Code Generator</h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Generate custom Arduino firmware for your ESP32 water quality monitoring device with your specific TTN credentials.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">OTAA</Badge>
          <Badge className="bg-blue-500/15 text-blue-500 border border-blue-500/30">ESP32</Badge>
          <Badge className="bg-purple-500/15 text-purple-500 border border-purple-500/30">LoRaWAN</Badge>
          <Badge className="bg-orange-500/15 text-orange-500 border border-orange-500/30">Water Sensors</Badge>
        </div>
      </div>

      {/* Required Libraries */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Required Arduino Libraries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Ensure the following libraries are installed via Arduino IDE → Tools → Manage Libraries:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "MCCI LoRaWAN LMIC",
              "OneWire",
              "DallasTemperature",
              "Adafruit SSD1306",
              "Adafruit GFX Library",
              "ESP32 board package"
            ].map((lib) => (
              <div key={lib} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-muted-foreground">{lib}</span>
              </div>
            ))}
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
            <p className="text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 inline mr-1 text-primary" />
              Install all libraries from the Arduino Library Manager or via PlatformIO. See the <a href="/docs/installation" className="text-primary hover:underline">Installation Guide</a> for detailed instructions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Code Generator Component */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Generate Your Custom Code</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Paste your TTN credentials below. The Arduino sketch will update in real-time with your specific DevEUI, AppEUI, and AppKey. 
          Copy the code or download the <code className="text-primary text-xs font-mono">.ino</code> file and flash it to your ESP32.
        </p>
        
        <ArduinoCodeGen />
      </section>

      {/* Code Features */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Code Features & Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">LoRaWAN & Communication</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>OTAA (Over-The-Air Activation) for secure join</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>60-second transmission interval (battery-friendly)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Automatic rejoin on network failure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Adaptive Data Rate (ADR) support</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Sensor Management</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>pH sensor with calibration support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>TDS sensor with baseline calibration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>DS18B20 temperature compensation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>OLED display for live sensor readings</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Data Payload</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>6-byte efficient payload format</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Temperature (÷10) • TDS • pH (÷100)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Compatible with TTN uplink decoder</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Automatic data type conversion</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Debugging & Monitoring</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Serial monitor output (115200 baud)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Join status and uplink confirmations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Real-time sensor value display on OLED</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Error handling and recovery mechanisms</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-primary">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 text-sm">
            {[
              {
                step: 1,
                title: "Get TTN Credentials",
                description: "From your TTN Console device page, copy DevEUI (LSB format) and AppKey (MSB format). See TTN Setup guide for details."
              },
              {
                step: 2,
                title: "Paste Credentials",
                description: "Enter your DevEUI and AppKey in the form above. The code will automatically update with your credentials."
              },
              {
                step: 3,
                title: "Verify Configuration",
                description: "Check that the LMIC library region is configured correctly (CFG_in866 for India). See Installation guide."
              },
              {
                step: 4,
                title: "Upload to ESP32",
                description: "Copy the generated code or download the .ino file. Open in Arduino IDE, select ESP32 board, and upload."
              },
              {
                step: 5,
                title: "Monitor Serial Output",
                description: "Open Serial Monitor (115200 baud) to see join attempts, sensor readings, and uplink confirmations."
              }
            ].map(({ step, title, description }) => (
              <li key={step} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                  {step}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-medium text-foreground mb-1">{title}</h4>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Calibration Notes */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Sensor Calibration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-500 mb-1">Calibration Required</h4>
                <p className="text-sm text-amber-200/90">
                  For accurate readings, calibrate your sensors before deployment. The generated code includes calibration constants that you can adjust.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-foreground mb-2">TDS Sensor Calibration</h4>
              <p className="text-muted-foreground mb-2">
                Adjust the <code className="text-primary font-mono">baseline</code> value:
              </p>
              <div className="bg-muted p-3 rounded-lg border border-border font-mono text-xs">
                <span className="text-muted-foreground">float</span> <span className="text-foreground">baseline</span> = <span className="text-emerald-500">1.83</span>; <span className="text-muted-foreground">// TDS voltage offset</span>
              </div>
              <p className="text-muted-foreground mt-2">
                Measure distilled water (should read 0 ppm) and adjust baseline accordingly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">pH Sensor Calibration</h4>
              <p className="text-muted-foreground mb-2">
                Adjust the <code className="text-primary font-mono">calibrationOffset</code> value:
              </p>
              <div className="bg-muted p-3 rounded-lg border border-border font-mono text-xs">
                <span className="text-muted-foreground">float</span> <span className="text-foreground">calibrationOffset</span> = <span className="text-emerald-500">13.50</span>; <span className="text-muted-foreground">// pH probe intercept</span>
              </div>
              <p className="text-muted-foreground mt-2">
                Use a pH 7.0 buffer solution to calibrate. Adjust offset until reading matches 7.0.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">❌ Device not joining TTN network</h4>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-2">
                <li>Verify DevEUI and AppKey match TTN Console exactly (check byte order: LSB vs MSB)</li>
                <li>Ensure LMIC library region configuration matches your frequency plan (CFG_in866 for India)</li>
                <li>Check gateway coverage using TTN Coverage Map</li>
                <li>Verify antenna is properly connected to LoRa module</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">❌ Sensor readings inaccurate</h4>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-2">
                <li>Calibrate sensors using known reference solutions (pH 7.0 buffer, distilled water)</li>
                <li>Check sensor connections and ensure proper voltage levels (3.3V)</li>
                <li>Verify DS18B20 has 4.7kΩ pull-up resistor on data line</li>
                <li>Allow sensors to stabilize for 2-3 minutes after immersion</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">❌ Uplinks successful but dashboard not updating</h4>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-2">
                <li>Check webhook configuration in TTN Console (see Webhooks guide)</li>
                <li>Verify payload decoder is correctly set up in TTN</li>
                <li>Ensure device ID in TTN matches device ID in dashboard</li>
                <li>Check Serial Monitor for payload structure confirmation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <section className="bg-gradient-to-r from-primary/10 to-cyan-500/10 p-8 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Download className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Code Generated Successfully!</h3>
            <p className="text-muted-foreground">Upload the code to your ESP32 and configure TTN webhook integration.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <a 
            href="/docs/ttn-setup"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Radio className="h-4 w-4" />
            Configure TTN Setup
          </a>
          <a 
            href="/docs/webhooks"
            className="inline-flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Webhook className="h-4 w-4" />
            Setup Webhooks
          </a>
        </div>
      </section>
    </div>
  );
}
