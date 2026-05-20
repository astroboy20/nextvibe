"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestJuicywayPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [juicywayAvailable, setJuicywayAvailable] = useState(false);
  const [windowKeys, setWindowKeys] = useState<string[]>([]);

  useEffect(() => {
    // Check if script is already loaded
    const checkJuicyway = () => {
      if (typeof window !== 'undefined') {
        const hasJuicyway = !!(window as any).Juicyway;
        setJuicywayAvailable(hasJuicyway);
        
        // Get all window keys that might be related
        const keys = Object.keys(window).filter(k => 
          k.toLowerCase().includes('juice') || 
          k.toLowerCase().includes('pay')
        );
        setWindowKeys(keys);
      }
    };

    // Check immediately
    checkJuicyway();

    // Check again after a delay
    const timer = setTimeout(checkJuicyway, 2000);

    return () => clearTimeout(timer);
  }, []);

  const testWidget = () => {
    if ((window as any).Juicyway) {
      console.log('Juicyway object:', (window as any).Juicyway);
      console.log('Juicyway.PayWithJuice:', (window as any).Juicyway.PayWithJuice);
      
      try {
        (window as any).Juicyway.PayWithJuice({
          key: "test-key-123",
          onSuccess: () => console.log('Success!'),
          onError: (err: any) => console.error('Error:', err),
          onClose: () => console.log('Closed')
        });
      } catch (error) {
        console.error('Error calling PayWithJuice:', error);
      }
    } else {
      alert('Juicyway not available!');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Juicyway Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Script Status:</h3>
            <p>Script URL: https://checkout.juicyway.com/pay.js</p>
            <p>Juicyway Available: {juicywayAvailable ? '✅ YES' : '❌ NO'}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Window Keys (juice/pay related):</h3>
            {windowKeys.length > 0 ? (
              <ul className="list-disc pl-5">
                {windowKeys.map(key => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No related keys found</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">All Window Keys (first 20):</h3>
            <div className="text-xs max-h-40 overflow-auto bg-muted p-2 rounded">
              {typeof window !== 'undefined' && Object.keys(window).slice(0, 20).join(', ')}
            </div>
          </div>

          <Button onClick={testWidget} disabled={!juicywayAvailable}>
            Test Juicyway Widget
          </Button>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Open browser DevTools (F12)</li>
              <li>Go to Network tab</li>
              <li>Refresh this page</li>
              <li>Look for "pay.js" in the network requests</li>
              <li>Check if it loads successfully (200) or fails (404, etc.)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
