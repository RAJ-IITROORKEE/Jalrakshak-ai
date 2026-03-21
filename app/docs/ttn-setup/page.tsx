import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Radio,
  Globe,
  Settings,
  Key,
  MapPin,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Info,
  Code,
  BarChart3
} from "lucide-react";

export const metadata = {
  title: "TTN Setup Guide - JalRakshak.AI Documentation",
  description: "Complete guide for setting up The Things Network (TTN) integration with JalRakshak.AI. Configure LoRaWAN applications, devices, and payload formatters.",
};

export default function TTNSetupPage() {
  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Radio className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">TTN Setup</h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
          Configure The Things Network (TTN) for LoRaWAN communication with your JalRakshak.AI water quality sensors.
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Badge className="bg-purple-500/15 text-purple-500 border-purple-500/30">LoRaWAN</Badge>
          <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/30">TTN Console</Badge>
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">OTAA</Badge>
          <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30">Device Management</Badge>
        </div>
      </div>

      {/* TTN Account Setup */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl md:text-2xl text-primary flex items-center gap-2">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span>TTN Account Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">1. Create TTN Account</h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <p>• Visit <a href="https://console.thethingsnetwork.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">console.thethingsnetwork.org</a></p>
                <p>• Click "Sign up" to create a free account</p>
                <p>• Verify your email address</p>
                <p>• Complete your profile setup</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">2. Choose Your Region</h3>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>Select the appropriate TTN cluster for your region:</p>
                <div className="bg-muted p-2 sm:p-3 rounded-lg space-y-1 font-mono text-[10px] sm:text-xs overflow-x-auto">
                  <div className="whitespace-nowrap">🌍 Europe: <span className="text-primary">eu1.cloud.thethings.network</span></div>
                  <div className="whitespace-nowrap">🇺🇸 North America: <span className="text-primary">nam1.cloud.thethings.network</span></div>
                  <div className="whitespace-nowrap">🌏 Asia-Pacific: <span className="text-primary">au1.cloud.thethings.network</span></div>
                  <div className="whitespace-nowrap">🇮🇳 India: Use <span className="text-primary">eu1</span> with <strong>India 865-867 MHz</strong></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Creation */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl md:text-2xl text-primary flex items-center gap-2">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span>Create Application</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm flex-shrink-0">1</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Navigate to Applications</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">In the TTN Console, click on "Applications" in the left sidebar.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Create New Application</h3>
                <p className="text-sm text-muted-foreground mb-3">Click "+ Create application" button and fill in the details:</p>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Application ID:</div>
                      <div className="bg-card p-2 rounded font-mono text-primary">jalrakshak-ai</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Application name:</div>
                      <div className="bg-card p-2 rounded font-mono text-foreground">JalRakshak Water Monitor</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-muted-foreground mb-1">Description:</div>
                      <div className="bg-card p-2 rounded font-mono text-foreground">LoRaWAN water quality monitoring sensors</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">3</div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Configure Application Settings</h3>
                <p className="text-sm text-muted-foreground">After creation, you can modify additional settings in the application overview.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Registration */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Key className="h-6 w-6" />
            Register End Device
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary">OTAA vs ABP</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This guide uses OTAA (Over-The-Air Activation) which is more secure and the recommended approach for production deployments.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Device Registration Process</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Register End Device</h4>
                    <p className="text-sm text-muted-foreground">In your application, click <strong className="text-primary">&quot;Register end device&quot;</strong></p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Enter End Device Specifics Manually</h4>
                    <p className="text-sm text-muted-foreground">Choose <strong className="text-primary">&quot;Enter end device specifics manually&quot;</strong> option</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">Select Frequency Plan</h4>
                    <div className="bg-muted p-3 rounded-lg border border-primary">
                      <div className="text-sm text-muted-foreground mb-2">Frequency Plan:</div>
                      <div className="bg-card p-2 rounded font-mono text-emerald-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        India 865-867 MHz (FSK)
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">For deployment in India</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">Select LoRaWAN Version</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">LoRaWAN version:</div>
                        <div className="bg-card p-2 rounded font-mono text-foreground">MAC V1.0.2</div>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Regional Parameters Version:</div>
                        <div className="bg-card p-2 rounded font-mono text-foreground">RP001 1.0.2 rev B</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">5</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">Set Join EUI (AppEUI)</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">JoinEUI / AppEUI:</div>
                      <div className="bg-card p-2 rounded font-mono text-purple-500 flex items-center justify-between">
                        <span>0000000000000000</span>
                        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">All Zeros</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Set to all zeros (0000000000000000)</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">6</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">Generate DEVEUI and AppKey</h4>
                    <div className="space-y-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">DevEUI (Device EUI):</div>
                        <div className="bg-card p-2 rounded font-mono text-primary flex items-center justify-between">
                          <span>Click Generate to create</span>
                          <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Auto-generated 16-character hex (LSB format for Arduino)</div>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">AppKey (Application Key):</div>
                        <div className="bg-card p-2 rounded font-mono text-emerald-500 flex items-center justify-between">
                          <span>Click Generate to create</span>
                          <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Auto-generated 32-character key (MSB format for Arduino)</div>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-200/90">
                            <strong>Important:</strong> DevEUI must be copied in <strong>LSB</strong> format. AppKey in <strong>MSB</strong> format. Use the ↕ toggle in the TTN Console.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">7</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">Give Device ID</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">End device ID:</div>
                      <div className="bg-card p-2 rounded font-mono text-foreground">jalrakshak-node-01</div>
                      <div className="text-xs text-muted-foreground mt-1">Choose a unique identifier for this device (e.g., location-based)</div>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h5 className="font-medium text-primary">Important: Device ID Linking</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            This Device ID becomes the <code className="text-primary font-mono">deviceId</code> stored in MongoDB. 
                            It will be used to identify this sensor in the dashboard and database.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">8</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">Register End Device</h4>
                    <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4 rounded-lg border border-emerald-500/30">
                      <p className="text-sm text-muted-foreground mb-2">
                        Review all settings and click <strong className="text-emerald-500">&quot;Register end device&quot;</strong> button
                      </p>
                      <div className="flex items-center gap-2 text-xs text-emerald-500">
                        <CheckCircle className="h-4 w-4" />
                        Device will be registered and credentials will be available
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payload Decoder */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Code className="h-6 w-6" />
            Payload Formatter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-primary">Why Payload Formatter?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  TTN can decode binary payloads before sending to your webhook, making data more readable. Configure this in the TTN Console under <strong>Payload formatters</strong> section.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Configure Custom JavaScript Formatter</h3>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-1">1</div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Go to your application → <strong className="text-foreground">Payload formatters</strong> → <strong className="text-foreground">Uplink</strong></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-1">2</div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Select <strong className="text-foreground">Formatter type:</strong> <span className="text-primary">Custom Javascript formatter</span></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-1">3</div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Paste the following code in the formatter field:</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">JavaScript Decoder Function:</div>
              <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </div>
            <pre className="text-emerald-500 font-mono text-sm overflow-x-auto">
{`function decodeUplink(input) {
  // Byte layout (6 bytes total):
  //  [0-1]  temperature  ÷ 10  → °C
  //  [2-3]  TDS          × 1   → ppm
  //  [4-5]  pH           ÷ 100 → 0–14

  var temp = (input.bytes[0] << 8 | input.bytes[1]) / 10;
  var tds  = (input.bytes[2] << 8 | input.bytes[3]);
  var ph   = (input.bytes[4] << 8 | input.bytes[5]) / 100;

  return {
    data: {
      temperature: temp,
      tds:         tds,
      ph:          ph
    }
  };
}`}
            </pre>
          </div>

          <div className="bg-muted p-4 rounded-lg border border-border">
            <h4 className="font-medium text-foreground mb-3">Payload Structure Explanation</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-card p-3 rounded">
                  <div className="text-muted-foreground mb-1">Bytes 0-1 - Temperature:</div>
                  <div className="text-foreground font-mono">
                    Value ÷ 10 = °C<br/>
                    <span className="text-emerald-500">Example: 253 → 25.3°C</span>
                  </div>
                </div>
                <div className="bg-card p-3 rounded">
                  <div className="text-muted-foreground mb-1">Bytes 2-3 - TDS:</div>
                  <div className="text-foreground font-mono">
                    Direct value in ppm<br/>
                    <span className="text-emerald-500">Example: 312 → 312 ppm</span>
                  </div>
                </div>
                <div className="bg-card p-3 rounded">
                  <div className="text-muted-foreground mb-1">Bytes 4-5 - pH:</div>
                  <div className="text-foreground font-mono">
                    Value ÷ 100 = pH<br/>
                    <span className="text-emerald-500">Example: 721 → 7.21</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded p-3">
                <h5 className="font-medium text-primary text-sm mb-2">Example Output:</h5>
                <div className="font-mono text-xs text-muted-foreground">
                  <div className="text-emerald-500">// Input bytes: [00, FD, 01, 38, 02, D1]</div>
                  <div>{'{'}</div>
                  <div>  &quot;temperature&quot;: <span className="text-cyan-500">25.3</span>,</div>
                  <div>  &quot;tds&quot;: <span className="text-blue-500">312</span>,</div>
                  <div>  &quot;ph&quot;: <span className="text-purple-500">7.21</span></div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-xs text-amber-200/90">
              <strong>Note:</strong> Turbidity and conductivity are generated server-side. Turbidity is a placeholder random value (1-10 NTU) until hardware is added. Conductivity is calculated as TDS × 2 μS/cm.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gateway Coverage */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Gateway Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Check Coverage</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Visit <a href="https://www.thethingsnetwork.org/map" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  TTN Coverage Map <ExternalLink className="h-3 w-3" />
                </a></p>
                <p>• Zoom to your deployment location</p>
                <p>• Verify gateway coverage in your area</p>
                <p>• Note nearest gateways and their range</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Range Considerations</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• <strong className="text-foreground">Urban areas:</strong> 2-5 km range</div>
                <div>• <strong className="text-foreground">Suburban areas:</strong> 5-15 km range</div>
                <div>• <strong className="text-foreground">Rural areas:</strong> 15+ km range</div>
                <div>• <strong className="text-foreground">Indoor deployment:</strong> Reduced range</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-500">No Coverage?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  If there are no gateways in your area, consider setting up your own TTN gateway or using a private LoRaWAN network server.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-8 rounded-lg border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              🎉 TTN Configuration Complete!
            </h3>
            <p className="text-muted-foreground text-sm">Your device is now registered and ready for webhook integration</p>
          </div>
        </div>
        
        <div className="bg-card/50 rounded-lg p-5 mb-5 border border-border/50">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            What&apos;s Configured:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              TTN Account & Application Setup
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Device Registration & Keys
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Payload Decoder Function
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Gateway Coverage Verification
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h4 className="font-semibold text-foreground mb-3">
            🚀 Next Steps:
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">1.</span>
              <span>Configure webhooks to send data to your JalRakshak.AI backend</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">2.</span>
              <span>Upload the generated Arduino code to your ESP32</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">3.</span>
              <span>Deploy your water quality sensor and monitor dashboard</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a 
            href="/docs/webhooks"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Settings className="h-4 w-4" />
            Configure Webhooks
          </a>
          <a 
            href="/docs/code-generator"
            className="inline-flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Code className="h-4 w-4" />
            Generate Arduino Code
          </a>
          <a 
            href="/"
            className="inline-flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <BarChart3 className="h-4 w-4" />
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
