'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const SEARCH_QUERIES = [
  'How to tie a necktie',
  'What to do when food sticks to a pan',
  'Why do plants need sunlight',
  'How to change a car tire',
  'What causes rust on metal',
  'How to fold origami crane',
  'Why does bread rise when baking',
  'How to jumpstart a car battery',
  'What to do if your phone gets wet',
  'Why do onions make you cry',
  'How to remove wine stains',
  'What causes hiccups',
  'How to sharpen knives',
  'Why does ice float',
  'How to fix a running toilet',
  'What to do during power outage',
  'Why do leaves change color',
  'How to unclog a drain',
  'What causes muscle cramps',
  'How to parallel park',
  'Why does coffee keep you awake',
  'How to grill salmon',
  'What to do if you lock keys in car',
  'Why do cats purr',
  'How to stop a nosebleed',
  'What causes brain freeze',
  'How to remove gum from clothes',
  'Why does metal feel colder than wood',
  'How to treat a minor burn',
  'What to do when smoke alarm won\'t stop',
  'How to wrap spring rolls',
  'Why do clouds float',
  'How to sharpen a knife',
  'How to make espresso',
  'How to brew tea properly',
  'How to poach an egg',
  'How to make hollandaise sauce',
  'How to filet a fish',
  'How to shuck oysters',
  'How to open a wine bottle',
  'How to decant wine',
  'How to fold napkins',
  'How to set up a tent',
  'How to build a campfire',
  'How to tie fishing knots',
  'How to bait a hook',
  'How to pitch a baseball',
  'How to shoot a basketball',
  'How to serve in tennis',
  'How to do a cartwheel',
  'How to do a handstand',
  'How to meditate properly',
  'How to stretch before running',
  'How to wrap hands for boxing',
  'How to tape an ankle',
  'How to apply makeup',
  'How to style hair',
  'How to shave with a razor',
  'How to trim a beard',
  'How to give a massage',
  'How to do CPR',
  'How to tie a bow tie',
  'How to polish silverware',
  'How to arrange flowers',
  'How to repot a plant',
  'How to water succulents',
  'How to prune bonsai',
  'How to start seeds indoors',
  'How to compost',
  'How to mulch a garden',
  'How to make a terrarium',
  'How to clean a grill',
  'How to season cast iron',
  'How to sharpen scissors',
  'How to sew a button',
  'How to hem pants',
  'How to darn socks',
  'How to remove stains',
  'How to fold laundry',
  'How to iron pleats',
  'How to clean windows',
  'How to wash a car',
  'How to wax a car',
  'How to check tire pressure',
  'How to change windshield wipers',
  'How to replace a car battery',
  'How to boost a car',
  'How to drive stick shift',
  'How to reverse park',
  'How to do a three-point turn',
  'How to check engine oil',
  'How to inflate a tire',
  'How to wrap a burrito',
  'How to roll sushi',
  'How to make dumplings',
  'How to fold wontons',
  'How to make pasta dough',
  'How to knead bread',
  'How to proof yeast',
  'How to temper chocolate',
  'How to whip cream',
  'How to separate eggs',
];

export default function SearchTicker() {
  // Duplicate the queries to create seamless loop
  const extendedQueries = [...SEARCH_QUERIES, ...SEARCH_QUERIES];

  return (
    <div className="w-full max-w-[1800px] mx-auto overflow-hidden rounded-xl glass-effect border-0 py-2.5 px-4 shadow-lg">
      <div className="flex items-center gap-2 mb-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">
          What Others Are Searching
        </span>
      </div>
      
      <div className="relative overflow-hidden" style={{ height: '28px' }}>
        <motion.div
          className="flex gap-2.5 absolute left-0 top-0"
          animate={{
            x: [0, -50 * SEARCH_QUERIES.length],
          }}
          transition={{
            x: {
              duration: SEARCH_QUERIES.length * 3,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          style={{ willChange: 'transform' }}
        >
          {extendedQueries.map((query, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/90 border border-violet-200/60 text-[11px] text-slate-700 shadow-sm whitespace-nowrap"
            >
              {query}
            </div>
          ))}
        </motion.div>
        
        {/* Gradient fade on edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/95 via-white/70 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/95 via-white/70 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}
