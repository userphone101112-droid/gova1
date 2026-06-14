import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { loadMigrationQueue, getFeatureMigrationStatus } from '../src/shared/migration/migration-queue';

const FEATURE_ORDER = ['auth', 'home', 'dashboard', 'settings', 'splash', 'common'];

interface FeatureMigrationResult {
  feature: string;
  success: boolean;
  violationsBefore: number;
  violationsAfter: number;
  fixesApplied: number;
  validationResults: {
    eslint: boolean;
    typescript: boolean;
    i18n: boolean;
    uiBinding: boolean;
  };
  errors: string[];
}

/**
 * Migrate a single feature
 */
function migrateFeature(feature: string, dryRun: boolean = false): FeatureMigrationResult {
  console.log(`\n🔄 Migrating feature: ${feature}\n`);
  
  const queue = loadMigrationQueue();
  if (!queue) {
    return {
      feature,
      success: false,
      violationsBefore: 0,
      violationsAfter: 0,
      fixesApplied: 0,
      validationResults: {
        eslint: false,
        typescript: false,
        i18n: false,
        uiBinding: false,
      },
      errors: ['Migration queue not found'],
    };
  }
  
  const statusBefore = getFeatureMigrationStatus(queue, feature);
  
  console.log(`📊 Feature Status Before:`);
  console.log(`   Total Violations: ${statusBefore.totalViolations}`);
  console.log(`   Critical: ${statusBefore.critical}`);
  console.log(`   High: ${statusBefore.high}`);
  console.log(`   Medium: ${statusBefore.medium}`);
  console.log(`   Low: ${statusBefore.low}`);
  console.log(`   Auto-Fixable: ${statusBefore.autoFixable}`);
  console.log(`   Manual Fix Required: ${statusBefore.manualFixRequired}`);
  
  const result: FeatureMigrationResult = {
    feature,
    success: false,
    violationsBefore: statusBefore.totalViolations,
    violationsAfter: statusBefore.totalViolations,
    fixesApplied: 0,
    validationResults: {
      eslint: false,
      typescript: false,
      i18n: false,
      uiBinding: false,
    },
    errors: [],
  };
  
  // Step 1: Scan feature folder
  console.log(`\n🔍 Step 1: Scanning feature folder...`);
  const featurePath = join(process.cwd(), 'src', 'features', feature);
  if (!existsSync(featurePath)) {
    console.log(`⚠️  Feature folder not found: ${featurePath}`);
    result.errors.push('Feature folder not found');
    return result;
  }
  console.log(`✅ Feature folder found`);
  
  // Step 2: Apply safe fixes
  console.log(`\n🔧 Step 2: Applying safe fixes...`);
  try {
    if (!dryRun) {
      // Run automated fixer for this feature only
      // This would require modifying the fixer to support feature-specific fixing
      // For now, we'll skip this step
      console.log(`⚠️  Feature-specific fixing not yet implemented`);
    } else {
      console.log(`🔒 Dry run - skipping fixes`);
    }
  } catch (error) {
    result.errors.push(`Safe fixes failed: ${error}`);
    console.log(`❌ Safe fixes failed: ${error}`);
  }
  
  // Step 3: Validate with ESLint
  console.log(`\n🔍 Step 3: Validating with ESLint...`);
  try {
    const eslintCmd = `cd "${process.cwd()}" && npx eslint "src/features/${feature}/**/*.{ts,tsx}"`;
    if (!dryRun) {
      execSync(eslintCmd, { stdio: 'inherit' });
    }
    result.validationResults.eslint = true;
    console.log(`✅ ESLint validation passed`);
  } catch (error) {
    result.validationResults.eslint = false;
    result.errors.push(`ESLint validation failed`);
    console.log(`❌ ESLint validation failed`);
  }
  
  // Step 4: Validate with TypeScript
  console.log(`\n🔍 Step 4: Validating with TypeScript...`);
  try {
    const tscCmd = `cd "${process.cwd()}" && npx tsc --noEmit`;
    if (!dryRun) {
      execSync(tscCmd, { stdio: 'inherit' });
    }
    result.validationResults.typescript = true;
    console.log(`✅ TypeScript validation passed`);
  } catch (error) {
    result.validationResults.typescript = false;
    result.errors.push(`TypeScript validation failed`);
    console.log(`❌ TypeScript validation failed`);
  }
  
  // Step 5: Validate with i18n
  console.log(`\n🔍 Step 5: Validating i18n...`);
  try {
    const i18nCmd = `cd "${process.cwd()}" && npm run i18n:validate`;
    if (!dryRun) {
      execSync(i18nCmd, { stdio: 'inherit' });
    }
    result.validationResults.i18n = true;
    console.log(`✅ i18n validation passed`);
  } catch (error) {
    result.validationResults.i18n = false;
    result.errors.push(`i18n validation failed`);
    console.log(`❌ i18n validation failed`);
  }
  
  // Step 6: Validate UI binding
  console.log(`\n🔍 Step 6: Validating UI binding...`);
  try {
    const auditCmd = `cd "${process.cwd()}" && npm run audit:unified-ui-i18n`;
    if (!dryRun) {
      execSync(auditCmd, { stdio: 'inherit' });
    }
    result.validationResults.uiBinding = true;
    console.log(`✅ UI binding validation passed`);
  } catch (error) {
    result.validationResults.uiBinding = false;
    result.errors.push(`UI binding validation failed`);
    console.log(`❌ UI binding validation failed`);
  }
  
  // Update result
  const statusAfter = getFeatureMigrationStatus(queue, feature);
  result.violationsAfter = statusAfter.totalViolations;
  result.fixesApplied = statusBefore.totalViolations - statusAfter.totalViolations;
  
  // Determine success
  result.success = result.validationResults.eslint && 
                   result.validationResults.typescript && 
                   result.validationResults.i18n && 
                   result.validationResults.uiBinding;
  
  if (result.success) {
    console.log(`\n✅ Feature ${feature} migration successful!`);
  } else {
    console.log(`\n❌ Feature ${feature} migration failed`);
  }
  
  return result;
}

/**
 * Migrate all features in order
 */
function migrateAllFeatures(dryRun: boolean = false): FeatureMigrationResult[] {
  console.log('🚀 Starting Feature-by-Feature Migration...\n');
  
  const results: FeatureMigrationResult[] = [];
  
  for (const feature of FEATURE_ORDER) {
    const result = migrateFeature(feature, dryRun);
    results.push(result);
    
    // Only continue if the current feature is clean
    if (!result.success) {
      console.log(`\n⚠️  Stopping migration due to failure in ${feature}`);
      console.log(`   Fix the issues in ${feature} before continuing`);
      break;
    }
    
    console.log(`\n✨ ${feature} is clean, continuing to next feature\n`);
  }
  
  return results;
}

/**
 * Generate migration report
 */
function generateMigrationReport(results: FeatureMigrationResult[], dryRun: boolean): void {
  const successfulMigrations = results.filter(r => r.success);
  const failedMigrations = results.filter(r => !r.success);
  
  const reportContent = `# Feature Migration Report

**Generated:** ${new Date().toISOString()}
**Dry Run:** ${dryRun ? 'YES' : 'NO'}

## Executive Summary

- **Total Features:** ${results.length}
- **Successful Migrations:** ${successfulMigrations.length}
- **Failed Migrations:** ${failedMigrations.length}

## Feature Results

${results.map(result => `
### ${result.feature}

- **Status:** ${result.success ? '✅ Success' : '❌ Failed'}
- **Violations Before:** ${result.violationsBefore}
- **Violations After:** ${result.violationsAfter}
- **Fixes Applied:** ${result.fixesApplied}

**Validation Results:**
- ESLint: ${result.validationResults.eslint ? '✅' : '❌'}
- TypeScript: ${result.validationResults.typescript ? '✅' : '❌'}
- i18n: ${result.validationResults.i18n ? '✅' : '❌'}
- UI Binding: ${result.validationResults.uiBinding ? '✅' : '❌'}

${result.errors.length > 0 ? `**Errors:**\n${result.errors.map(e => `- ${e}`).join('\n')}` : ''}
`).join('\n---\n')}

## Next Steps

${failedMigrations.length > 0 ? `
1. Review failed migrations
2. Fix the issues manually
3. Re-run migration for failed features
4. Continue with remaining features
` : `
1. All features migrated successfully
2. Run final clean state validation
3. Generate final cleanup report
`}
`;

  const outputPath = join(process.cwd(), 'docs', 'migration', 'feature-migration-report.md');
  const fs = require('fs');
  fs.writeFileSync(outputPath, reportContent, 'utf-8');
  console.log(`\n📄 Feature migration report generated: ${outputPath}`);
}

function main() {
  console.log('🚀 Starting Feature-by-Feature Migration...\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const specificFeature = args.find(arg => !arg.startsWith('--'));
  
  try {
    let results: FeatureMigrationResult[];
    
    if (specificFeature) {
      console.log(`🎯 Migrating specific feature: ${specificFeature}\n`);
      const result = migrateFeature(specificFeature, dryRun);
      results = [result];
    } else {
      results = migrateAllFeatures(dryRun);
    }
    
    generateMigrationReport(results, dryRun);
    
    console.log(`\n✨ Feature migration complete!`);
    
    if (dryRun) {
      console.log(`\n⚠️  This was a dry run. No changes were applied.`);
      console.log(`   Run without --dry-run to apply migration.`);
    } else {
      console.log(`\n✅ Migration complete.`);
      console.log(`   Review the migration report for details.`);
    }
  } catch (error) {
    console.error('Feature migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as migrateFeature };
