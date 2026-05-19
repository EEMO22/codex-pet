set -e

mkdir -p __petcanvas_root

if [ -d apps/pet-overlay ]; then
  (
    cd apps/pet-overlay
    find . -mindepth 1 -maxdepth 1 -exec mv {} ../../__petcanvas_root/ \;
  )
fi

if [ -d pets ]; then
  mv pets __petcanvas_root/pets
fi

find . -mindepth 1 -maxdepth 1 ! -name .git ! -name __petcanvas_root -exec rm -rf {} +

if [ -d __petcanvas_root ]; then
  (
    cd __petcanvas_root
    find . -mindepth 1 -maxdepth 1 -exec mv {} .. \;
  )
  rmdir __petcanvas_root
fi
