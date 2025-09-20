import React, { useState } from 'react';
import TypingIndicator from '../common/ui/TypingIndicator';

const TypingTest: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  return (
    <div className="p-8 bg-neutral-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Typing Animation Test
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-neutral-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
            <button
              onClick={() => setShowAnimation(!showAnimation)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showAnimation ? 'Hide' : 'Show'} Animation
            </button>
          </div>

          {/* Animation Display */}
          {showAnimation && (
            <div className="bg-neutral-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Animation Preview
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-700 shadow-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="p-4 rounded-3xl bg-neutral-700 border border-neutral-600">
                    <TypingIndicator variant="dots" size="medium" />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-700 shadow-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="p-4 rounded-3xl bg-neutral-700 border border-neutral-600">
                    <TypingIndicator variant="pulse" size="medium" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Variants */}
          <div className="bg-neutral-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">
              All Variants
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white mb-2">Dots Animation:</h3>
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-3xl bg-neutral-700 border border-neutral-600">
                    <TypingIndicator variant="dots" size="small" />
                  </div>
                  <div className="p-4 rounded-3xl bg-neutral-700 border border-neutral-600">
                    <TypingIndicator variant="dots" size="medium" />
                  </div>
                  <div className="p-4 rounded-3xl bg-neutral-700 border border-neutral-600">
                    <TypingIndicator variant="dots" size="large" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white mb-2">Pulse Animation:</h3>
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-3xl bg-neutral-700 border border-neutral-600">
                    <TypingIndicator variant="pulse" size="small" />
                  </div>
                  <div className="p-4 rounded-3xl bg-neutral-700 border border-neutral-600">
                    <TypingIndicator variant="pulse" size="medium" />
                  </div>
                  <div className="p-4 rounded-3xl bg-neutral-700 border border-neutral-600">
                    <TypingIndicator variant="pulse" size="large" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
