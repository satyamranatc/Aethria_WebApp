import { Zap, Code, ShieldCheck, Sparkles, Terminal, Cpu } from 'lucide-react';

export const APP_INFO = {
  name: 'Aethria',
  tagline: 'Aethria is a cutting-edge AI coding assistant developed by Satyam Rana',
  creator: 'Satyam Rana',
  creatorWebsite: 'https://satyamrana.in',
  siteUrl: 'https://www.aethria.in',
  version: '2.5.0'
};

export const VOICE_GENDERS = [
  { id: 'female', label: 'Female Voice', persona: 'Neerja (Studio Natural)' },
  { id: 'male', label: 'Male Voice', persona: 'Prabhat (Deep & Articulate)' }
];

export const SAMPLE_PROMPTS = [
  "Write a clean React custom hook for WebSocket connection with automatic retry.",
  "Explain quantum computing algorithms with everyday analogies.",
  "Optimize this Express backend API with Redis caching and rate limiting.",
  "Draft an engaging 30-second keynote script for Aethria AI."
];

export const CAPABILITIES = [
  {
    icon: Code,
    badge: 'Code Intelligence',
    title: 'Cutting-Edge Code Assistant',
    description: 'Designed by Satyam Rana with deep algorithmic reasoning, syntax mastery, and clean software architecture.'
  },
  {
    icon: Zap,
    badge: 'Groq LPU Engine',
    title: 'Sub-100ms Inference',
    description: 'Instant token generation and rapid response streaming powered by dedicated Language Processing Units.'
  },
  {
    icon: Sparkles,
    badge: 'Cinematic Audio',
    title: 'Neural Voice & Hinglish',
    description: 'Expressive Indian English and Hinglish neural voice performance with studio warmth and natural cadence.'
  }
];
