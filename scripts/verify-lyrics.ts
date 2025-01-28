#!/usr/bin/env node --loader ts-node/esm

import { generateVerificationReport } from '../src/lib/utils/lyrics-verification.js';

async function main() {
  console.log('Starting lyrics verification process...\n');
  
  try {
    const report = await generateVerificationReport();
    console.log(report);
  } catch (error) {
    console.error('Error during lyrics verification:', error);
    process.exit(1);
  }
}

main();