import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Droplet,
  Zap,
  Radio,
  BarChart3,
  Shield,
  Globe,
  Cpu,
  CheckCircle,
  ArrowRight,
  Code2,
  Download,
  CircuitBoard
} from "lucide-react";
import Link from "next/link";

export default function DocsGettingStartedPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Badge className="bg-primary/10 text-primary border border-primary/30">
          <Droplet className="mr-1.5 h-3 w-3" />
          Getting Started
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Welcome to <span className="gradient-text">JalRakshak.AI</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Real-time water quality monitoring powered by LoRaWAN, AI predictions, and IoT sensors.
          Monitor pH, TDS, temperature, turbidity, and conductivity with intelligent safety analysis.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">LoRaWAN</Badge>
          <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">The Things Network</Badge>
          <Badge className="bg-blue-500/15 text-blue-500 border border-blue-500/30">Real-time Monitoring</Badge>
          <Badge className="bg-purple-500/15 text-purple-500 border border-purple-500/30">Next.js 16</Badge>
          <Badge className="bg-orange-500/15 text-orange-500 border border-orange-500/30">ESP32</Badge>
          <Badge className="bg-pink-500/15 text-pink-500 border border-pink-500/30">AI Predictions</Badge>
        </div>
      </div>

      {/* What is JalRakshak.AI */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">What is JalRakshak.AI?</h2>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed mb-4">
              JalRakshak.AI is an advanced IoT-based water quality monitoring system that combines hardware sensors 
              with AI-powered predictions to provide real-time insights into water safety. The system uses LoRaWAN 
              for long-range, low-power communication, making it ideal for remote water sources.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  Hardware Components
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>ESP32 microcontroller (30-pin dev board)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>LoRa SX1276 radio module (868 MHz)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>pH sensor with analog probe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>TDS (Total Dissolved Solids) sensor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>DS18B20 waterproof temperature probe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>OLED display (128×64 SSD1306)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Software Stack
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Next.js 16 with App Router</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>MongoDB with Prisma ORM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>The Things Network (TTN) integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Python FastAPI for AI predictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>TypeScript fallback prediction engine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Real-time dashboard with Recharts</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Key Features */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/60 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Real-time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor water quality parameters in real-time with 60-second intervals. View live data, 
                historical trends, and instant alerts on unsafe conditions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                AI-Powered Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Random Forest Classifier trained on 3,276+ samples provides safety scores, risk analysis, 
                root cause detection, and actionable recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary" />
                LoRaWAN Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Long-range (up to 15 km), low-power communication via The Things Network. Perfect for 
                remote water sources with extended battery life.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Beautiful, responsive dashboard with device cards, sensor history charts, live stats, 
                and interactive AI model simulator.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Quick Start Guide</h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Installation & Setup",
              description: "Install Arduino IDE, ESP32 board package, and required libraries (MCCI LoRaWAN LMIC, DallasTemperature, Adafruit SSD1306).",
              icon: Download,
              link: "/docs/installation"
            },
            {
              step: 2,
              title: "Hardware Assembly",
              description: "Connect LoRa module, sensors (pH, TDS, DS18B20), and OLED display to ESP32 following the pin diagram.",
              icon: CircuitBoard,
              link: "/docs/circuit-diagram"
            },
            {
              step: 3,
              title: "TTN Configuration",
              description: "Create TTN account, register application, add end device with OTAA, and configure uplink decoder.",
              icon: Radio,
              link: "/docs/ttn-setup"
            },
            {
              step: 4,
              title: "Code Generation & Upload",
              description: "Use the Arduino code generator to create custom firmware with your TTN credentials, then flash to ESP32.",
              icon: Code2,
              link: "/docs/code-generator"
            },
            {
              step: 5,
              title: "Deploy & Monitor",
              description: "Deploy your sensor node, verify webhook integration, and start monitoring water quality on the dashboard.",
              icon: BarChart3,
              link: "/"
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} className="border-border/60 hover:border-primary/50 transition-colors group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <Link 
                        href={item.link}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group-hover:gap-2"
                      >
                        Learn more <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* System Requirements */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">System Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Development Environment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center justify-between">
                <span>Arduino IDE</span>
                <Badge variant="outline" className="text-xs">v2.0+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>ESP32 Board Package</span>
                <Badge variant="outline" className="text-xs">v2.0+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Node.js</span>
                <Badge variant="outline" className="text-xs">v18+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>MongoDB</span>
                <Badge variant="outline" className="text-xs">v5.0+</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Hardware Requirements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center justify-between">
                <span>Microcontroller</span>
                <Badge variant="outline" className="text-xs">ESP32</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>LoRa Module</span>
                <Badge variant="outline" className="text-xs">SX1276/78</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Power Supply</span>
                <Badge variant="outline" className="text-xs">3.7V LiPo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>TTN Gateway Coverage</span>
                <Badge variant="outline" className="text-xs">Required</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What's Next */}
      <section className="bg-gradient-to-r from-primary/10 to-cyan-500/10 p-8 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Ready to Get Started?</h3>
            <p className="text-muted-foreground">Follow the installation guide to set up your first water quality monitoring node.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <Link 
            href="/docs/installation"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Download className="h-4 w-4" />
            Installation Guide
          </Link>
          <Link 
            href="/docs/circuit-diagram"
            className="inline-flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <CircuitBoard className="h-4 w-4" />
            Circuit Diagram
          </Link>
        </div>
      </section>
    </div>
  );
}
