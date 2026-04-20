import React from 'react';
import { Badge } from "./badge";
import { Activity } from "lucide-react";

export function NetworkMap() {
  const nodes = [
    { id: 'DEL', name: 'AIIMS New Delhi', x: '45%', y: '25%', status: 'active', pulse: 'text-emerald-500 bg-emerald-500' },
    { id: 'MUM', name: 'Fortis Mumbai', x: '30%', y: '55%', status: 'emergency', pulse: 'text-rose-500 bg-rose-500' },
    { id: 'BLR', name: 'Red Cross BLR', x: '40%', y: '80%', status: 'active', pulse: 'text-emerald-500 bg-emerald-500' },
    { id: 'CHN', name: 'Apollo Chennai', x: '45%', y: '85%', status: 'warning', pulse: 'text-amber-500 bg-amber-500' },
    { id: 'HYD', name: 'NBC Hyderabad', x: '42%', y: '65%', status: 'active', pulse: 'text-blue-500 bg-blue-500' },
    { id: 'KOL', name: 'ZOTTO East', x: '75%', y: '45%', status: 'active', pulse: 'text-emerald-500 bg-emerald-500' },
  ];

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl bg-[#030712] border border-gray-800 overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="outline" className="flex items-center gap-1.5 bg-black/50 border-gray-800 text-gray-300 backdrop-blur-md">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>Live Network</span>
        </Badge>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> NORMAL
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> HIGH TRAFFIC
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> EMERGENCY
        </div>
      </div>

      {/* Abstract India Map SVG Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center p-8">
        <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500" fill="currentColor">
          <path d="M 40 10 Q 50 0 60 10 T 65 30 T 85 45 T 80 55 T 60 55 T 50 85 Q 45 95 40 85 T 35 60 T 20 50 T 25 35 T 40 30 Z" opacity="0.3" />
          {/* Subtle grid layout to look techy */}
          <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Nodes */}
      <div className="absolute inset-0">
        {/* Connection Lines (Simulated Transport) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="45%" y1="25%" x2="42%" y2="65%" stroke="rgba(59,130,246,0.3)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
          <line x1="45%" y1="85%" x2="42%" y2="65%" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
          <line x1="30%" y1="55%" x2="42%" y2="65%" stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" />
          <circle cx="36%" cy="60%" r="2" fill="#f43f5e" className="animate-pulse" /> {/* Simulating a transport node */}
        </svg>

        {nodes.map(node => (
          <div key={node.id} className="absolute flex flex-col items-center justify-center group" style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}>
            <div className={`relative flex items-center justify-center w-6 h-6`}>
              <span className={`absolute inline-flex w-full h-full rounded-full opacity-40 animate-ping ${node.pulse.split(' ')[1]}`}></span>
              <span className={`relative inline-flex rounded-full w-2 h-2 ${node.pulse.split(' ')[1]}`}></span>
            </div>
            <div className="absolute top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-gray-800 rounded-md px-2 py-1 text-[10px] text-gray-300 whitespace-nowrap z-20 pointer-events-none shadow-xl">
              {node.name}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </div>
  );
}
