'strict'

Main = imports.ui.main;
const { Clutter } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

let original_onStageKeyPress;

let SearchController;

function init() {
}

function enable() {
    if (Main.overview._overview.controls._searchController) {
        SearchController = Main.overview._overview.controls._searchController;
    } else {
        log(`${Me.Metadata.name}: Error: Incompatible Shell version`);
        return;
    }
    original_onStageKeyPress = SearchController._onStageKeyPress;
    SearchController._onStageKeyPress = _onStageKeyPress;
}

function disable() {
    if (SearchController)
        SearchController._onStageKeyPress = original_onStageKeyPress;
}

function _onStageKeyPress(actor, event) {
    if (Main.modalCount > 1)
      return Clutter.EVENT_PROPAGATE;
    let symbol = event.get_key_symbol();

    if ([Clutter.KEY_Tab, Clutter.KEY_Up, Clutter.KEY_Down, Clutter.KEY_Left, Clutter.KEY_Right].includes(symbol)) {
        if (Main.overview.dash.showAppsButton.checked) {
            Main.ctrlAltTabManager._items.forEach(i => {if (i.sortGroup === 1 && i.name === 'Applications') Main.ctrlAltTabManager.focusGroup(i)});
        } else {
            Main.ctrlAltTabManager._items.forEach(i => {if (i.sortGroup === 1 && i.name === 'Windows') Main.ctrlAltTabManager.focusGroup(i)});
        }
    }
    if (symbol === Clutter.KEY_Escape) {
        if (this._searchActive)
            this.reset();
        // Esc should always close the Overview
        /*else if (this._showAppsButton.checked)
            this._showAppsButton.checked = false;*/
        else
            Main.overview.hide();
        return Clutter.EVENT_STOP;
    } else if (this._shouldTriggerSearch(symbol)) {
        this.startSearch(event);
    }
    return Clutter.EVENT_PROPAGATE;
}

