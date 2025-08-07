import React, { useState, useEffect } from 'react';
import { VoiceWidget } from '@/components/VoiceWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bot, Code, CheckCircle, Mic, Smartphone, Shield, Palette, Plug, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const { data: configData } = useQuery({
    queryKey: ['/api/widget/demo-config'],
    enabled: true,
  });

  const [demoConfig, setDemoConfig] = useState({
    apiKey: 'your_api_key_here',
    agentId: 'your_agent_id_here',
    position: 'bottom-right' as const,
    primaryColor: '#2563EB',
    buttonSize: 'medium' as const,
  });

  useEffect(() => {
    if (configData) {
      setDemoConfig(prev => ({
        ...prev,
        apiKey: (configData as any).apiKey || 'your_api_key_here',
        agentId: (configData as any).agentId || 'your_agent_id_here',
      }));
    }
  }, [configData]);

  const codeSnippet = `<!-- Add before closing </body> tag -->
<script src="${window.location.origin}/retell-widget.js"></script>
<script>
  RetellWidget.init({
    apiKey: '${demoConfig.apiKey}',
    agentId: '${demoConfig.agentId}',
    position: 'bottom-right',
    theme: {
      primaryColor: '#2563EB',
      buttonSize: 'medium'
    }
  });
</script>`;

  const [showDemo, setShowDemo] = useState(true);

  const features = [
    {
      icon: <Mic className="w-4 h-4 text-blue-600" />,
      title: 'Real-time voice conversation',
    },
    {
      icon: <Smartphone className="w-4 h-4 text-blue-600" />,
      title: 'Responsive across all devices',
    },
    {
      icon: <Shield className="w-4 h-4 text-blue-600" />,
      title: 'Secure microphone handling',
    },
    {
      icon: <Palette className="w-4 h-4 text-blue-600" />,
      title: 'Customizable appearance',
    },
    {
      icon: <Plug className="w-4 h-4 text-blue-600" />,
      title: 'Easy integration (one script tag)',
    },
    {
      icon: <Globe className="w-4 h-4 text-blue-600" />,
      title: 'Cross-browser compatible',
    },
  ];

  const widgetStates = [
    {
      state: 'idle',
      title: 'Idle',
      description: 'Ready to start conversation',
      bgColor: 'bg-blue-600',
    },
    {
      state: 'listening',
      title: 'Listening',
      description: 'Recording your voice',
      bgColor: 'bg-green-500',
      pulse: true,
    },
    {
      state: 'processing',
      title: 'Processing',
      description: 'AI is thinking',
      bgColor: 'bg-amber-500',
    },
    {
      state: 'speaking',
      title: 'Speaking',
      description: 'AI is responding',
      bgColor: 'bg-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Retell.AI Voice Widget</h1>
                <p className="text-sm text-gray-600">Embeddable voice assistant integration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo Integration</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Integration Guide Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Code Integration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Code className="w-5 h-5 text-blue-600 mr-2" />
                  Add to Your Website
                </h3>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto">
                  <pre className="text-sm">
                    <code>{codeSnippet}</code>
                  </pre>
                </div>
                <p className="text-sm text-gray-600">
                  The widget will automatically handle microphone permissions and voice streaming.
                </p>
              </div>

              {/* Features List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      {feature.icon}
                      <span className="ml-3">{feature.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget States Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Widget States Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {widgetStates.map((state, index) => (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
                      state.bgColor
                    )}>
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    {state.pulse && (
                      <div className="absolute inset-0 rounded-full bg-green-500 opacity-25 animate-ping" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900">{state.title}</h3>
                  <p className="text-sm text-gray-600">{state.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Configuration Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Position Options */}
              <div>
                <Label className="text-lg font-medium text-gray-900 mb-4 block">Position</Label>
                <RadioGroup 
                  value={demoConfig.position}
                  onValueChange={(value: any) => setDemoConfig(prev => ({ ...prev, position: value }))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-right" id="bottom-right" />
                    <Label htmlFor="bottom-right">Bottom Right (default)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-left" id="bottom-left" />
                    <Label htmlFor="bottom-left">Bottom Left</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="top-right" id="top-right" />
                    <Label htmlFor="top-right">Top Right</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="top-left" id="top-left" />
                    <Label htmlFor="top-left">Top Left</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Theme Options */}
              <div>
                <Label className="text-lg font-medium text-gray-900 mb-4 block">Theme Customization</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primary-color" className="text-sm font-medium text-gray-700 mb-2 block">
                      Primary Color
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="primary-color"
                        type="color" 
                        value={demoConfig.primaryColor}
                        onChange={(e) => setDemoConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10"
                      />
                      <span className="text-sm text-gray-600">{demoConfig.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="button-size" className="text-sm font-medium text-gray-700 mb-2 block">
                      Button Size
                    </Label>
                    <Select 
                      value={demoConfig.buttonSize}
                      onValueChange={(value: any) => setDemoConfig(prev => ({ ...prev, buttonSize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (48px)</SelectItem>
                        <SelectItem value="medium">Medium (56px)</SelectItem>
                        <SelectItem value="large">Large (64px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Test the widget configuration in real-time
                </p>
              </div>
              <Button 
                onClick={() => setShowDemo(!showDemo)}
                variant={showDemo ? "destructive" : "default"}
              >
                {showDemo ? "Hide Demo Widget" : "Show Demo Widget"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Demo Voice Widget */}
      {showDemo && (
        <VoiceWidget
          apiKey={demoConfig.apiKey}
          agentId={demoConfig.agentId}
          position={demoConfig.position}
          primaryColor={demoConfig.primaryColor}
          buttonSize={demoConfig.buttonSize}
        />
      )}
    </div>
  );
}
