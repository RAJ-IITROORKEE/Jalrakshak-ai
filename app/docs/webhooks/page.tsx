import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Webhook,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Shield,
  Code,
  Terminal,
  BarChart3,
  Globe
} from "lucide-react";

export const metadata = {
  title: "Webhook Configuration - JalRakshak.AI Documentation",
  description: "Configure webhooks to send water quality sensor data from The Things Network to your JalRakshak.AI backend.",
};

export default function WebhooksPage() {
  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Webhook className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Webhook Configuration</h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
          Configure TTN webhooks to automatically send water quality sensor data to your JalRakshak.AI backend for processing and storage.
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">Webhooks</Badge>
          <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/30">API Integration</Badge>
          <Badge className="bg-purple-500/15 text-purple-500 border-purple-500/30">Real-time Data</Badge>
          <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30">MongoDB</Badge>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center gap-2">
            <Info className="h-5 w-5" />
            What are Webhooks?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Webhooks are HTTP callbacks that automatically send data from TTN to your application when events occur (like receiving sensor uplinks).
            The JalRakshak.AI webhook endpoint receives, decodes, and stores water quality readings in MongoDB.
          </p>
          <div className="bg-card p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">Data Flow:</h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-cyan-500">1. Sensor</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-purple-500">2. LoRaWAN</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-blue-500">3. TTN</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-emerald-500">4. Webhook</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-orange-500">5. MongoDB</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-pink-500">6. Dashboard</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Setup */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Setting Up Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-500">Important</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Ensure your JalRakshak.AI application is deployed and publicly accessible before configuring webhooks.
                  For local development, you can use the SmartPark relay as a bridge.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Webhook Configuration Steps</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">Navigate to Webhooks</h4>
                  <p className="text-sm text-muted-foreground">In your TTN application, go to "Integrations" → "Webhooks"</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">Add Webhook</h4>
                  <p className="text-sm text-muted-foreground mb-3">Click "+ Add webhook" → "Custom webhook"</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">Configure Webhook ID</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Webhook ID:</div>
                    <div className="bg-card p-2 rounded font-mono text-primary">jalrakshak-uplink</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">Set Base URL</h4>
                  
                  <div className="space-y-4">
                    {/* Production URL */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong className="text-foreground">Production</strong> (after Vercel deploy):
                      </p>
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="font-mono text-xs sm:text-sm text-emerald-500 break-all">
                          https://jalrakshak-ai-dualcore.vercel.app/api/webhook
                        </div>
                      </div>
                    </div>

                    {/* Local Development URL */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong className="text-foreground">Local Development</strong> (use SmartPark relay as bridge):
                      </p>
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="font-mono text-xs sm:text-sm text-blue-500 break-all">
                          https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        The relay forwards data to your localhost. Useful during development when your server isn&apos;t publicly accessible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">5</div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">Enable Uplink Message</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Under <strong className="text-foreground">Enabled messages</strong>, tick <strong className="text-foreground">Uplink message</strong> only.
                  </p>
                  <div className="bg-card p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-500 text-sm font-medium">Uplink message</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">6</div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">Optional: Secure with Shared Secret</h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>For production, secure your webhook with a shared secret:</p>
                    
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium text-foreground mb-2">Add custom header in TTN:</p>
                      <div className="font-mono text-xs space-y-1">
                        <div>Header: <span className="text-primary">X-TTN-Secret</span></div>
                        <div>Value: <span className="text-primary">your_secret_value</span></div>
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium text-foreground mb-2">Set the same value in Vercel environment:</p>
                      <div className="font-mono text-xs text-foreground">
                        TTN_WEBHOOK_SECRET=your_secret_value
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs">
                        <Info className="h-3.5 w-3.5 inline mr-1 text-primary" />
                        Leave both unset for open access (fine for hackathon / development).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoint Details */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Code className="h-6 w-6" />
            Webhook API Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">POST</Badge>
              <span className="font-mono text-sm text-foreground">/api/webhook</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Receives TTN uplink data, decodes payload, and stores readings in MongoDB.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Expected Payload Structure:</h4>
            <div className="bg-muted p-4 rounded-lg border border-border">
              <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`{
  "end_device_ids": {
    "device_id": "jalrakshak-node-01",
    "application_ids": {
      "application_id": "jalrakshak-ai"
    }
  },
  "uplink_message": {
    "decoded_payload": {
      "temperature": 25.3,
      "tds": 312,
      "ph": 7.21
    },
    "rx_metadata": [
      {
        "gateway_ids": {
          "gateway_id": "your-gateway"
        },
        "rssi": -85,
        "snr": 9.5
      }
    ]
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Backend Processing:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Extracts device ID and decoded sensor readings</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Generates turbidity (placeholder) and calculates conductivity (TDS × 2)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Creates/updates Device document with latest reading timestamp</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Stores Reading document in MongoDB with all parameters</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Dashboard automatically fetches and displays new data</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing & Verification */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            Testing & Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            After configuring the webhook, verify it&apos;s working correctly:
          </p>

          <div className="space-y-3">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">1</span>
                Check Webhook Status in TTN Console
              </h4>
              <div className="text-sm text-muted-foreground space-y-1 ml-8">
                <div>• Navigate to your webhook configuration</div>
                <div>• Click &quot;Test&quot; to send a test payload</div>
                <div>• Verify you receive a <span className="text-emerald-500 font-mono">200 OK</span> response</div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">2</span>
                Check Database for New Readings
              </h4>
              <div className="text-sm text-muted-foreground space-y-1 ml-8">
                <div>• Visit <code className="text-primary font-mono">/api/sensor-data</code> in your browser</div>
                <div>• Verify readings are being stored with correct device ID</div>
                <div>• Check timestamps are current</div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">3</span>
                Verify Dashboard Updates
              </h4>
              <div className="text-sm text-muted-foreground space-y-1 ml-8">
                <div>• Power on your ESP32 sensor and wait for transmission</div>
                <div>• Check if device card appears on dashboard</div>
                <div>• Verify sensor readings display correctly</div>
                <div>• Confirm AI predictions generate successfully</div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">4</span>
                Monitor Serial Output (ESP32)
              </h4>
              <div className="text-sm text-muted-foreground space-y-1 ml-8">
                <div>• Open Arduino Serial Monitor (115200 baud)</div>
                <div>• Verify JOIN_ACCEPT message received</div>
                <div>• Confirm uplink transmissions every 60 seconds</div>
                <div>• Check sensor readings before transmission</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Troubleshooting Common Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 text-sm">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-red-500 mb-2">❌ Webhook returns 404 or 500 errors</h4>
              <div className="space-y-1 text-muted-foreground">
                <div className="font-medium text-foreground">Possible causes:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Webhook URL is incorrect or server is not deployed</li>
                  <li>API route doesn&apos;t exist or has errors</li>
                  <li>Server is not publicly accessible</li>
                </ul>
                <div className="font-medium text-foreground mt-3">Solutions:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Verify URL matches your deployed application</li>
                  <li>Check Vercel deployment logs for errors</li>
                  <li>Test endpoint manually with curl or Postman</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-red-500 mb-2">❌ Data received but not stored in database</h4>
              <div className="space-y-1 text-muted-foreground">
                <div className="font-medium text-foreground">Possible causes:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>MongoDB connection string is incorrect</li>
                  <li>Payload structure doesn&apos;t match expected format</li>
                  <li>TTN payload decoder not configured</li>
                </ul>
                <div className="font-medium text-foreground mt-3">Solutions:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check <code className="text-primary font-mono">DATABASE_URL</code> in environment variables</li>
                  <li>Verify payload decoder is set up correctly in TTN</li>
                  <li>Test database connection with <code className="text-primary font-mono">/api/db-test</code></li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-red-500 mb-2">❌ Dashboard not showing new data</h4>
              <div className="space-y-1 text-muted-foreground">
                <div className="font-medium text-foreground">Possible causes:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Dashboard polling interval too long</li>
                  <li>Device ID mismatch between TTN and expected format</li>
                  <li>Data stuck in relay (for local development)</li>
                </ul>
                <div className="font-medium text-foreground mt-3">Solutions:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Manually refresh dashboard page</li>
                  <li>Verify device ID format matches exactly</li>
                  <li>Check if MongoDB has recent readings for this device</li>
                  <li>Clear browser cache and reload</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-primary">Need More Help?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Check TTN Console → Application → Live data to see real-time messages from your devices.
                  This is the best way to debug webhook and payload issues.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-primary/10 to-cyan-500/10 p-8 rounded-lg border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">🎉 Setup Complete!</h3>
            <p className="text-muted-foreground">Your JalRakshak.AI system is now fully configured and ready to monitor water quality.</p>
          </div>
        </div>
        
        <div className="bg-card/50 rounded-lg p-5 mb-5 border border-border/50">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            System Ready:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              TTN Application & Device Configured
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Payload Decoder Active
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Webhooks Forwarding Data
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Dashboard Displaying Readings
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a 
            href="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <BarChart3 className="h-4 w-4" />
            View Dashboard
          </a>
          <a 
            href="/docs"
            className="inline-flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Globe className="h-4 w-4" />
            Back to Docs Home
          </a>
        </div>
      </div>
    </div>
  );
}
