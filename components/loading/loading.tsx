import React from 'react';
import { Loader2 } from 'lucide-react';

function loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default loading;
