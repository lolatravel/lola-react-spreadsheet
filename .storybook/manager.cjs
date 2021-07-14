import { addons } from "@storybook/addons";
import { create } from "@storybook/theming/create";

addons.setConfig({
    theme: create({
        base: "light",
        brandTitle: "lola-react-spreadsheet",
        gridCellSize: 12,
    }),
    isFullscreen: false,
    showNav: true,
    showPanel: false,
    panelPosition: "bottom",
    enableShortcuts: false,
    isToolshown: true,
    selectedPanel: undefined,
    initialActive: "sidebar",
    sidebar: {
        showRoots: false,
    },
    toolbar: {
        title: { hidden: true },
        zoom: { hidden: true },
        eject: { hidden: true },
        copy: { hidden: true },
        fullscreen: { hidden: false },
    },
});
