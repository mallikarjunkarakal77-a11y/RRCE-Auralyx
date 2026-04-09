import { useState, useEffect } from "react";
import { Leaf } from "lucide-react";

interface CO2EmissionsProps {
  promptTokens: number;
  responseTokens: number;
}

interface EmissionData {
  promptEmissions: number;
  responseEmissions: number;
  totalEmissions: number;
}

export function CO2Emissions({ promptTokens, responseTokens }: CO2EmissionsProps) {
  const [emissions, setEmissions] = useState<EmissionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (promptTokens > 0 || responseTokens > 0) {
      calculateEmissions();
    }
  }, [promptTokens, responseTokens]);

  const calculateEmissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_CLIMATIQ_API_KEY;

      if (!apiKey || apiKey === 'your_climatiq_api_key_here') {
        // Use estimated values if no API key is provided
        const promptEmissions = (promptTokens / 1000) * 0.5; // ~0.5g CO2 per 1000 tokens
        const responseEmissions = (responseTokens / 1000) * 0.5;
        const totalEmissions = promptEmissions + responseEmissions;

        setEmissions({
          promptEmissions: Number(promptEmissions.toFixed(3)),
          responseEmissions: Number(responseEmissions.toFixed(3)),
          totalEmissions: Number(totalEmissions.toFixed(3))
        });
        setLoading(false);
        return;
      }

      // Calculate emissions for prompt tokens
      const promptResponse = await fetch('https://api.climatiq.io/data/v1/estimate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emission_factor: {
            id: "electricity-energy_source_grid_mix",
          },
          parameters: {
            energy: (promptTokens / 1000) * 0.001, // Rough estimate: 1kWh per 1000 tokens
            energy_unit: "kWh"
          }
        })
      });

      const promptData = await promptResponse.json();

      // Calculate emissions for response tokens
      const responseApiResponse = await fetch('https://api.climatiq.io/data/v1/estimate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emission_factor: {
            id: "electricity-energy_source_grid_mix",
          },
          parameters: {
            energy: (responseTokens / 1000) * 0.001, // Rough estimate: 1kWh per 1000 tokens
            energy_unit: "kWh"
          }
        })
      });

      const responseData = await responseApiResponse.json();

      const promptEmissions = promptData.co2e || 0;
      const responseEmissions = responseData.co2e || 0;
      const totalEmissions = promptEmissions + responseEmissions;

      setEmissions({
        promptEmissions: Number(promptEmissions.toFixed(3)),
        responseEmissions: Number(responseEmissions.toFixed(3)),
        totalEmissions: Number(totalEmissions.toFixed(3))
      });

    } catch (err) {
      console.error('Error calculating emissions:', err);
      setError('Failed to calculate emissions');

      // Fallback to estimated values
      const promptEmissions = (promptTokens / 1000) * 0.5;
      const responseEmissions = (responseTokens / 1000) * 0.5;
      const totalEmissions = promptEmissions + responseEmissions;

      setEmissions({
        promptEmissions: Number(promptEmissions.toFixed(3)),
        responseEmissions: Number(responseEmissions.toFixed(3)),
        totalEmissions: Number(totalEmissions.toFixed(3))
      });
    } finally {
      setLoading(false);
    }
  };

  if (!emissions && !loading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="glass-card p-4 space-y-3 min-w-[280px] shadow-lg border border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-500" />
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
            Carbon Footprint
          </h3>
        </div>

        {loading && (
          <div className="text-xs text-muted-foreground">Calculating emissions...</div>
        )}

        {error && (
          <div className="text-xs text-red-500">Using estimated values</div>
        )}

        {emissions && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prompt:</span>
              <span className="font-mono text-green-600 dark:text-green-400">
                {emissions.promptEmissions}g CO₂
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Response:</span>
              <span className="font-mono text-green-600 dark:text-green-400">
                {emissions.responseEmissions}g CO₂
              </span>
            </div>
            <div className="border-t border-green-500/20 pt-2 flex justify-between font-semibold">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-mono text-green-700 dark:text-green-300">
                {emissions.totalEmissions}g CO₂
              </span>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Based on {promptTokens + responseTokens} tokens processed
        </div>
      </div>
    </div>
  );
}