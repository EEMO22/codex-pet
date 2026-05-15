const path = require('node:path');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const { rcedit } = await import('rcedit');
  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  const iconPath = path.join(context.packager.projectDir, 'assets', 'icon.ico');

  await rcedit(exePath, {
    icon: iconPath,
    'version-string': {
      CompanyName: 'Codex Pet Contributors',
      FileDescription: 'Codex Pet Overlay',
      ProductName: 'Codex Pet Overlay'
    }
  });
};
