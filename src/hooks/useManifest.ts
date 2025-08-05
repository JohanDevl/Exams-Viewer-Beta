'use client';

import { useState, useEffect } from 'react';

interface ManifestData {
  version: string;
  generated: string;
  totalExams: number;
  totalQuestions: number;
  exams: Array<{
    code: string;
    name: string;
    description: string;
    questionCount: number;
    lastUpdated: string;
  }>;
}

export function useManifest() {
  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadManifest() {
      try {
        const response = await fetch('/data/manifest.json');
        if (!response.ok) {
          throw new Error('Failed to load manifest');
        }
        const data = await response.json();
        setManifest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadManifest();
  }, []);

  return { manifest, loading, error };
}