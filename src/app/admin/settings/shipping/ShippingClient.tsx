"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Globe, Settings2 } from "lucide-react";
import { createShippingZone, deleteShippingZone, createShippingRate, deleteShippingRate } from "./actions";
import { Button } from "@/components/ui/button";

export default function ShippingClient({ initialZones }: { initialZones: any[] }) {
  const [zones, setZones] = useState(initialZones);
  const [isPending, startTransition] = useTransition();

  // Zone Form State
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneCountries, setNewZoneCountries] = useState<string[]>(["US"]);

  // Rate Form State
  const [addingRateToZone, setAddingRateToZone] = useState<string | null>(null);
  const [rateName, setRateName] = useState("Standard");
  const [ratePrice, setRatePrice] = useState(10);
  const [rateCondition, setRateCondition] = useState("NONE");
  const [rateMin, setRateMin] = useState(0);

  const handleCreateZone = () => {
    if (!newZoneName.trim()) return;
    setIsAddingZone(false);
    startTransition(async () => {
      const res = await createShippingZone(newZoneName, newZoneCountries);
      if (res.success && res.zone) {
        setZones(prev => [...prev, { ...res.zone, rates: [] }]);
        setNewZoneName("");
        setNewZoneCountries(["US"]);
      } else {
        alert(res.error);
      }
    });
  };

  const handleDeleteZone = (id: string) => {
    if (!confirm("Are you sure you want to delete this zone and all its rates?")) return;
    startTransition(async () => {
      setZones(prev => prev.filter(z => z.id !== id));
      await deleteShippingZone(id);
    });
  };

  const handleCreateRate = (zoneId: string) => {
    if (!rateName.trim()) return;
    setAddingRateToZone(null);
    startTransition(async () => {
      const res = await createShippingRate(
        zoneId, 
        rateName, 
        ratePrice, 
        rateCondition, 
        rateCondition === "PRICE" ? rateMin : null, 
        null
      );
      if (res.success && res.rate) {
        setZones(prev => prev.map(z => z.id === zoneId ? { ...z, rates: [...z.rates, res.rate] } : z));
        // Reset defaults
        setRateName("Standard");
        setRatePrice(10);
        setRateCondition("NONE");
        setRateMin(0);
      } else {
        alert(res.error);
      }
    });
  };

  const handleDeleteRate = (zoneId: string, rateId: string) => {
    startTransition(async () => {
      setZones(prev => prev.map(z => z.id === zoneId ? { ...z, rates: z.rates.filter((r: any) => r.id !== rateId) } : z));
      await deleteShippingRate(rateId);
    });
  };

  return (
    <div className="space-y-6">
      
      {zones.map((zone) => (
        <div key={zone.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                <p className="text-xs text-gray-500">
                  {JSON.parse(zone.countries).join(", ")}
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleDeleteZone(zone.id)}
              disabled={isPending}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {zone.rates.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No rates defined. Customers in this zone cannot checkout.</p>
            ) : (
              <div className="space-y-2">
                {zone.rates.map((rate: any) => (
                  <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{rate.name}</div>
                      {rate.condition === "PRICE" && (
                        <div className="text-xs text-gray-500">Condition: Order price ≥ ${rate.minCondition}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-sm">{rate.price === 0 ? "Free" : `$${rate.price.toFixed(2)}`}</span>
                      <button 
                        onClick={() => handleDeleteRate(zone.id, rate.id)}
                        disabled={isPending}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {addingRateToZone === zone.id ? (
              <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rate Name</label>
                    <input type="text" value={rateName} onChange={e => setRateName(e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price ($)</label>
                    <input type="number" value={ratePrice} onChange={e => setRatePrice(Number(e.target.value))} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                    <select value={rateCondition} onChange={e => setRateCondition(e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black">
                      <option value="NONE">No Condition</option>
                      <option value="PRICE">Based on Order Price</option>
                    </select>
                  </div>
                  {rateCondition === "PRICE" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Order Price ($)</label>
                      <input type="number" value={rateMin} onChange={e => setRateMin(Number(e.target.value))} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAddingRateToZone(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => handleCreateRate(zone.id)} disabled={isPending}>Save Rate</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => setAddingRateToZone(zone.id)}>
                <Plus className="h-4 w-4 mr-2" /> Add Rate
              </Button>
            )}
          </div>
        </div>
      ))}

      {isAddingZone ? (
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2">Create New Zone</h3>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Zone Name</label>
            <input 
              type="text" 
              placeholder="e.g. Domestic" 
              value={newZoneName}
              onChange={e => setNewZoneName(e.target.value)}
              className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black max-w-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Countries (Comma separated codes)</label>
            <input 
              type="text" 
              placeholder="e.g. US, CA, GB" 
              value={newZoneCountries.join(", ")}
              onChange={e => setNewZoneCountries(e.target.value.split(",").map(s => s.trim().toUpperCase()).filter(Boolean))}
              className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black max-w-sm" 
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreateZone} disabled={isPending || !newZoneName}>Save Zone</Button>
            <Button variant="outline" size="sm" onClick={() => setIsAddingZone(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsAddingZone(true)} disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" /> Create Shipping Zone
        </Button>
      )}

    </div>
  );
}
