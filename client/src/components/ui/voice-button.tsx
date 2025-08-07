import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, Brain, Volume2, AlertTriangle } from "lucide-react";

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state: VoiceState;
  size?: 'small' | 'medium' | 'large';
  primaryColor?: string;
}

const sizeMap = {
  small: 'w-12 h-12',
  medium: 'w-14 h-14', 
  large: 'w-16 h-16'
};

const iconSizeMap = {
  small: 'w-4 h-4',
  medium: 'w-5 h-5',
  large: 'w-6 h-6'
};

export const VoiceButton = React.forwardRef<HTMLButtonElement, VoiceButtonProps>(
  ({ className, state, size = 'medium', primaryColor, style, ...props }, ref) => {
    const getStateConfig = (state: VoiceState) => {
      switch (state) {
        case 'idle':
          return {
            bg: `bg-[${primaryColor}] hover:bg-[${primaryColor}]/90`,
            icon: <Mic className={iconSizeMap[size]} />,
            pulse: false
          };
        case 'listening':
          return {
            bg: 'bg-green-500 hover:bg-green-600',
            icon: <Mic className={iconSizeMap[size]} />,
            pulse: true
          };
        case 'processing':
          return {
            bg: 'bg-amber-500 hover:bg-amber-600',
            icon: <Brain className={`${iconSizeMap[size]} animate-pulse`} />,
            pulse: false
          };
        case 'speaking':
          return {
            bg: 'bg-purple-600 hover:bg-purple-700',
            icon: <Volume2 className={`${iconSizeMap[size]} animate-bounce`} />,
            pulse: false
          };
        case 'error':
          return {
            bg: 'bg-red-600 hover:bg-red-700',
            icon: <AlertTriangle className={iconSizeMap[size]} />,
            pulse: false
          };
      }
    };

    const config = getStateConfig(state);
    const customStyle = primaryColor && state === 'idle' 
      ? { backgroundColor: primaryColor, ...style }
      : style;

    return (
      <div className="relative">
        <button
          className={cn(
            sizeMap[size],
            "rounded-full shadow-xl hover:shadow-2xl transition-all duration-200",
            "flex items-center justify-center group focus:outline-none",
            "focus:ring-4 focus:ring-blue-300",
            !primaryColor || state !== 'idle' ? config.bg : '',
            className
          )}
          style={customStyle}
          ref={ref}
          {...props}
        >
          <span className="text-white">
            {config.icon}
          </span>
        </button>
        
        {config.pulse && (
          <div className="absolute inset-0 rounded-full bg-green-500 opacity-25 animate-ping" />
        )}
      </div>
    );
  }
);

VoiceButton.displayName = "VoiceButton";
