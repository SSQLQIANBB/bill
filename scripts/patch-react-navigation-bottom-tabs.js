const fs = require("node:fs");
const path = require("node:path");

const packageRoot = path.resolve(__dirname, "..");
const bottomTabsRoot = path.join(
  packageRoot,
  "node_modules",
  "expo-router",
  "node_modules",
  "@react-navigation",
  "bottom-tabs"
);

const patches = [
  {
    file: path.join(bottomTabsRoot, "lib", "module", "views", "BottomTabView.js"),
    replacements: [
      {
        from: `style: [StyleSheet.absoluteFill, {
            zIndex: isFocused ? 0 : -1
          }],
          active: activityState,
          enabled: detachInactiveScreens,
          freezeOnBlur: freezeOnBlur,
          shouldFreeze: activityState === STATE_INACTIVE && !isPreloaded,
          pointerEvents: isFocused ? 'box-none' : 'none',`,
        to: `style: [StyleSheet.absoluteFill, {
            zIndex: isFocused ? 0 : -1,
            pointerEvents: isFocused ? 'box-none' : 'none'
          }],
          active: activityState,
          enabled: detachInactiveScreens,
          freezeOnBlur: freezeOnBlur,
          shouldFreeze: activityState === STATE_INACTIVE && !isPreloaded,`
      }
    ]
  },
  {
    file: path.join(bottomTabsRoot, "lib", "module", "views", "BottomTabBar.js"),
    replacements: [
      {
        from: `}], tabBarStyle],
    pointerEvents: isTabBarHidden ? 'none' : 'auto',
    onLayout: sidebar ? undefined : handleLayout,
    children: [/*#__PURE__*/_jsx(View, {
      pointerEvents: "none",
      style: StyleSheet.absoluteFill,`,
        to: `}], tabBarStyle, {
      pointerEvents: isTabBarHidden ? 'none' : 'auto'
    }],
    onLayout: sidebar ? undefined : handleLayout,
    children: [/*#__PURE__*/_jsx(View, {
      style: [StyleSheet.absoluteFill, {
        pointerEvents: "none"
      }],`
      }
    ]
  },
  {
    file: path.join(bottomTabsRoot, "src", "views", "BottomTabView.tsx"),
    replacements: [
      {
        from: `key={route.key}
              style={[StyleSheet.absoluteFill, { zIndex: isFocused ? 0 : -1 }]}
              active={activityState}
              enabled={detachInactiveScreens}
              freezeOnBlur={freezeOnBlur}
              shouldFreeze={activityState === STATE_INACTIVE && !isPreloaded}
              pointerEvents={isFocused ? 'box-none' : 'none'}`,
        to: `key={route.key}
              style={[
              StyleSheet.absoluteFill,
              {
                zIndex: isFocused ? 0 : -1,
                pointerEvents: isFocused ? 'box-none' : 'none',
              },
            ]}
            active={activityState}
            enabled={detachInactiveScreens}
            freezeOnBlur={freezeOnBlur}
            shouldFreeze={activityState === STATE_INACTIVE && !isPreloaded}`
      }
    ]
  },
  {
    file: path.join(bottomTabsRoot, "src", "views", "BottomTabBar.tsx"),
    replacements: [
      {
        pattern: /tabBarStyle,\r?\n\s*\]\}\r?\n\s*pointerEvents=\{isTabBarHidden \? 'none' : 'auto'\}/,
        to: `tabBarStyle,
          {
            pointerEvents: isTabBarHidden ? 'none' : 'auto',
          },
        ]}`
      },
      {
        pattern: /<View pointerEvents="none" style=\{StyleSheet\.absoluteFill\}>/,
        to: `<View
          style={[
            StyleSheet.absoluteFill,
            {
              pointerEvents: 'none',
            },
          ]}
        >`
      }
    ]
  }
];

for (const patch of patches) {
  if (!fs.existsSync(patch.file)) {
    throw new Error(`Cannot patch missing file: ${patch.file}`);
  }

  let source = fs.readFileSync(patch.file, "utf8");
  let changed = false;

  for (const replacement of patch.replacements) {
    if (source.includes(replacement.to)) {
      continue;
    }

    if (replacement.pattern) {
      if (!replacement.pattern.test(source)) {
        throw new Error(`Patch target not found in ${patch.file}`);
      }
      source = source.replace(replacement.pattern, replacement.to);
      changed = true;
      continue;
    }

    if (!source.includes(replacement.from)) {
      throw new Error(`Patch target not found in ${patch.file}`);
    }

    source = source.replace(replacement.from, replacement.to);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(patch.file, source);
    console.log(`Patched ${path.relative(packageRoot, patch.file)}`);
  }
}
