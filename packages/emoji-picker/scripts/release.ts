import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const bumpVersion = (version: string, type: 'patch' | 'minor' | 'major'): string => {
  const [major, minor, patch] = version.replace('v', '').split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
};

const main = async () => {
  const type = process.argv[2] as 'patch' | 'minor' | 'major';
  if (!['patch', 'minor', 'major'].includes(type)) {
    console.error('Please specify version type: patch, minor, or major');
    process.exit(1);
  }

  // Read current version from package.json
  const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
  const currentVersion = pkg.version;
  const newVersion = bumpVersion(currentVersion, type);

  // Update package.json
  pkg.version = newVersion;
  writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');

  try {
    // Commit package.json changes
    execSync('git add package.json');
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);

    // Create and push tag
    execSync(`git tag v${newVersion}`);
    execSync('git push');
    execSync('git push --tags');

    console.log(`Successfully released version ${newVersion}`);
  } catch (error) {
    console.error('Error during release:', error);
    process.exit(1);
  }
};

main().catch(console.error);
