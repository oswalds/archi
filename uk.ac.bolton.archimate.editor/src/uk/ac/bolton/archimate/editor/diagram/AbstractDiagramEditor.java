/*******************************************************************************
 * Copyright (c) 2010 Bolton University, UK.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the License
 * which accompanies this distribution in the file LICENSE.txt
 *******************************************************************************/
package uk.ac.bolton.archimate.editor.diagram;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.EventObject;
import java.util.List;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.draw2d.PositionConstants;
import org.eclipse.draw2d.geometry.Dimension;
import org.eclipse.draw2d.geometry.Point;
import org.eclipse.emf.common.notify.Adapter;
import org.eclipse.emf.common.notify.Notification;
import org.eclipse.emf.ecore.util.EContentAdapter;
import org.eclipse.gef.DefaultEditDomain;
import org.eclipse.gef.EditPart;
import org.eclipse.gef.GraphicalViewer;
import org.eclipse.gef.MouseWheelHandler;
import org.eclipse.gef.MouseWheelZoomHandler;
import org.eclipse.gef.SnapToGeometry;
import org.eclipse.gef.SnapToGrid;
import org.eclipse.gef.commands.CommandStack;
import org.eclipse.gef.dnd.TemplateTransferDragSourceListener;
import org.eclipse.gef.editparts.ZoomManager;
import org.eclipse.gef.palette.PaletteListener;
import org.eclipse.gef.palette.ToolEntry;
import org.eclipse.gef.requests.CreationFactory;
import org.eclipse.gef.tools.AbstractTool;
import org.eclipse.gef.tools.CreationTool;
import org.eclipse.gef.ui.actions.ActionRegistry;
import org.eclipse.gef.ui.actions.AlignmentAction;
import org.eclipse.gef.ui.actions.DirectEditAction;
import org.eclipse.gef.ui.actions.MatchHeightAction;
import org.eclipse.gef.ui.actions.MatchWidthAction;
import org.eclipse.gef.ui.actions.UpdateAction;
import org.eclipse.gef.ui.actions.ZoomInAction;
import org.eclipse.gef.ui.actions.ZoomOutAction;
import org.eclipse.gef.ui.palette.FlyoutPaletteComposite;
import org.eclipse.gef.ui.palette.PaletteViewer;
import org.eclipse.gef.ui.palette.PaletteViewerProvider;
import org.eclipse.gef.ui.parts.GraphicalEditorWithFlyoutPalette;
import org.eclipse.gef.ui.parts.GraphicalViewerKeyHandler;
import org.eclipse.help.IContextProvider;
import org.eclipse.jface.action.ActionContributionItem;
import org.eclipse.jface.action.IAction;
import org.eclipse.jface.action.IMenuManager;
import org.eclipse.jface.commands.ActionHandler;
import org.eclipse.jface.util.IPropertyChangeListener;
import org.eclipse.jface.util.PropertyChangeEvent;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.CLabel;
import org.eclipse.swt.events.MouseAdapter;
import org.eclipse.swt.events.MouseEvent;
import org.eclipse.swt.events.MouseTrackAdapter;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Listener;
import org.eclipse.swt.widgets.Menu;
import org.eclipse.swt.widgets.TypedListener;
import org.eclipse.swt.widgets.Widget;
import org.eclipse.ui.IEditorInput;
import org.eclipse.ui.IEditorPart;
import org.eclipse.ui.IEditorSite;
import org.eclipse.ui.IWorkbenchPart;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.actions.ActionFactory;
import org.eclipse.ui.handlers.IHandlerService;
import org.eclipse.ui.views.contentoutline.IContentOutlinePage;
import org.eclipse.ui.views.properties.IPropertySheetPage;
import org.eclipse.ui.views.properties.tabbed.ITabbedPropertySheetPageContributor;
import org.eclipse.ui.views.properties.tabbed.TabbedPropertySheetPage;

import uk.ac.bolton.archimate.editor.ArchimateEditorPlugin;
import uk.ac.bolton.archimate.editor.diagram.actions.BringForwardAction;
import uk.ac.bolton.archimate.editor.diagram.actions.BringToFrontAction;
import uk.ac.bolton.archimate.editor.diagram.actions.ConnectionLineColorAction;
import uk.ac.bolton.archimate.editor.diagram.actions.ConnectionLineWidthAction;
import uk.ac.bolton.archimate.editor.diagram.actions.ConnectionRouterAction;
import uk.ac.bolton.archimate.editor.diagram.actions.CopyAction;
import uk.ac.bolton.archimate.editor.diagram.actions.CutAction;
import uk.ac.bolton.archimate.editor.diagram.actions.DefaultEditPartSizeAction;
import uk.ac.bolton.archimate.editor.diagram.actions.ExportAsImageAction;
import uk.ac.bolton.archimate.editor.diagram.actions.ExportAsImageToClipboardAction;
import uk.ac.bolton.archimate.editor.diagram.actions.FillColorAction;
import uk.ac.bolton.archimate.editor.diagram.actions.FontAction;
import uk.ac.bolton.archimate.editor.diagram.actions.FontColorAction;
import uk.ac.bolton.archimate.editor.diagram.actions.FullScreenAction;
import uk.ac.bolton.archimate.editor.diagram.actions.PasteAction;
import uk.ac.bolton.archimate.editor.diagram.actions.PrintDiagramAction;
import uk.ac.bolton.archimate.editor.diagram.actions.PropertiesAction;
import uk.ac.bolton.archimate.editor.diagram.actions.SelectAllAction;
import uk.ac.bolton.archimate.editor.diagram.actions.SendBackwardAction;
import uk.ac.bolton.archimate.editor.diagram.actions.SendToBackAction;
import uk.ac.bolton.archimate.editor.diagram.actions.TextAlignmentAction;
import uk.ac.bolton.archimate.editor.diagram.actions.ToggleGridEnabledAction;
import uk.ac.bolton.archimate.editor.diagram.actions.ToggleGridVisibleAction;
import uk.ac.bolton.archimate.editor.diagram.actions.ToggleSnapToAlignmentGuidesAction;
import uk.ac.bolton.archimate.editor.diagram.dnd.PaletteTemplateTransferDropTargetListener;
import uk.ac.bolton.archimate.editor.diagram.tools.FormatPainterInfo;
import uk.ac.bolton.archimate.editor.diagram.tools.FormatPainterToolEntry;
import uk.ac.bolton.archimate.editor.preferences.IPreferenceConstants;
import uk.ac.bolton.archimate.editor.preferences.Preferences;
import uk.ac.bolton.archimate.editor.ui.services.ComponentSelectionManager;
import uk.ac.bolton.archimate.editor.utils.PlatformUtils;
import uk.ac.bolton.archimate.model.IArchimateModel;
import uk.ac.bolton.archimate.model.IArchimatePackage;
import uk.ac.bolton.archimate.model.IDiagramModel;


/**
 * Abstract GEF Diagram Editor that checks for valid Editor Input.
 * If the Editor Input is of type NullDiagramEditorInput it shows a warning message.
 * This can happen when Eclipse tries to restore an Editor Part and the Diagram Model cannot be restored
 * because the model's file may have been deleted, renamed or moved on the file system.
 * 
 * @author Phillip Beauvoir
 */
public abstract class AbstractDiagramEditor extends GraphicalEditorWithFlyoutPalette
implements IDiagramModelEditor, IContextProvider, ITabbedPropertySheetPageContributor {

    /*
     * Error handlers
     */
    private Composite fErrorComposite;
    private NullDiagramEditorInput fNullInput;
    
    /**
     * Graphics Model
     */
    protected IDiagramModel fDiagramModel;
    
    /**
     * Actions that need to be updated after CommandStack changed
     */
    protected List<UpdateAction> fUpdateCommandStackActions = new ArrayList<UpdateAction>();
    
    /**
     * Listen to User Preferences Changes
     */
    protected IPropertyChangeListener appPreferencesListener = new IPropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent event) {
            applicationPreferencesChanged(event);
        }
    };
    
    /**
     * Application Preference changed
     * @param event
     */
    protected void applicationPreferencesChanged(PropertyChangeEvent event) {
        if(IPreferenceConstants.GRID_SIZE == event.getProperty()) {
            applyUserGridPreferences();
        }
        else if(IPreferenceConstants.GRID_VISIBLE == event.getProperty()) {
            applyUserGridPreferences();
        }
        else if(IPreferenceConstants.GRID_SNAP == event.getProperty()) {
            applyUserGridPreferences();
        }
        else if(IPreferenceConstants.GRID_SHOW_GUIDELINES == event.getProperty()) {
            applyUserGridPreferences();
        }
    }
    
    /**
     * Adapter class to respond to Archimate Model notifications.
     */
    protected Adapter eCoreAdapter = new EContentAdapter() {
        @Override
        public void notifyChanged(Notification msg) {
            super.notifyChanged(msg);
            eCoreModelChanged(msg);
        }
    };
    
    @Override
    public void init(IEditorSite site, IEditorInput input) throws PartInitException {
        if(input instanceof NullDiagramEditorInput) {
            fNullInput = (NullDiagramEditorInput)input;
            super.setSite(site);
            super.setInput(input); // Make sure to call super.setInput(input)
            setPartName(input.getName());
        }
        else {
            super.init(site, input);
        }
    }
    
    @Override
    public void setInput(IEditorInput input) {
        super.setInput(input);
        
        // This first - set model
        fDiagramModel = ((DiagramEditorInput)input).getDiagramModel();
        
        // Listen to its notifications
        fDiagramModel.getArchimateModel().eAdapters().add(eCoreAdapter);
        
        // Edit Domain before init
        // Use CommandStack from Model
        DefaultEditDomain domain = new DefaultEditDomain(this) {
            private CommandStack stack;
            
            @Override
            public CommandStack getCommandStack() {
                if(stack == null) {
                    stack = (CommandStack)fDiagramModel.getAdapter(CommandStack.class);
                }
                return stack;
            }
        };
        
        setEditDomain(domain);
        
        // Part Name
        setPartName(input.getName());

        // Listen to App Prefs changes
        Preferences.STORE.addPropertyChangeListener(appPreferencesListener);
    }

    @Override
    public void createPartControl(Composite parent) {
        // Show error message
        if(fNullInput != null) {
            createErrorComposite(parent);
        }
        else {
            super.createPartControl(parent);
            doCreatePartControl(parent);
            // TODO - Remove this Monkey Patch
            fixBug321560();
        }
    }
    
    /**
     * Create the Error composite messate
     * @param parent
     */
    protected void createErrorComposite(Composite parent) {
        fErrorComposite = new Composite(parent, SWT.NULL);
        fErrorComposite.setLayout(new GridLayout());
        fErrorComposite.setLayoutData(new GridData(GridData.FILL_BOTH));
        String message1 = "This View is no longer available.";
        String message2 = "Cannot find the model's file: ";
        CLabel imageLabel = new CLabel(fErrorComposite, SWT.NULL);
        imageLabel.setImage(Display.getDefault().getSystemImage(SWT.ICON_INFORMATION));
        imageLabel.setText(message1);
        String fileName = fNullInput.getFileName();
        if(fileName != null) {
            message2 += fileName;
        }
        Label l = new Label(fErrorComposite, SWT.NULL);
        l.setText(message2);
    }
    
    public IDiagramModel getModel() {
        return fDiagramModel;
    }
    
    /**
     * Do the createPartControl(Composite parent) method
     */
    protected abstract void doCreatePartControl(Composite parent);
    
    /**
     * Register a context menu
     */
    protected abstract void registerContextMenu(GraphicalViewer viewer);
    
    /**
     * Create the Root Edit Part
     */
    protected abstract void createRootEditPart(GraphicalViewer viewer);
    
    
    @Override
    protected void configureGraphicalViewer() {
        super.configureGraphicalViewer();

        GraphicalViewer viewer = getGraphicalViewer();
        
        // Key handler
        viewer.setKeyHandler(new GraphicalViewerKeyHandler(viewer));
        
        // Context menu
        registerContextMenu(viewer);
        
        // Set the Root Edit Part *before* Actions as the Edit Part will create and register a new ZoomManager
        createRootEditPart(viewer);
        
        // Create Actions after Viewer created and after Root Edit Part set
        createActions(viewer);
        
        // Create a drop target listener for this palette viewer
        // this will enable model element creation by dragging a CombinatedTemplateCreationEntries 
        // from the palette into the editor
        viewer.addDropTargetListener(new PaletteTemplateTransferDropTargetListener(this));
        
        // Set some Properties
        setProperties();
    }
    
    @Override
    public void setFocus() {
        if(fNullInput != null) {
            fErrorComposite.setFocus();
        }
        else {
            super.setFocus();
        }
    }
    
    @Override
    public GraphicalViewer getGraphicalViewer() {
        return super.getGraphicalViewer();
    }
    
    @Override
    protected DefaultEditDomain getEditDomain() {
        if(fNullInput != null) {
            return new DefaultEditDomain(this);
        }
        else {
            return super.getEditDomain();
        }
    }
    
    /**
     * Set Graphical Properties
     */
    protected void setProperties() {
        // Grid Preferences
        applyUserGridPreferences();
        
        // Ctrl + Scroll wheel Zooms
        getGraphicalViewer().setProperty(MouseWheelHandler.KeyGenerator.getKey(SWT.MOD1), MouseWheelZoomHandler.SINGLETON);
    }

    /**
     * Apply grid Prefs
     */
    protected void applyUserGridPreferences() {
        // Grid Spacing
        int gridSize = Preferences.getGridSize();
        getGraphicalViewer().setProperty(SnapToGrid.PROPERTY_GRID_SPACING, new Dimension(gridSize, gridSize));
        
        // Grid Visible
        getGraphicalViewer().setProperty(SnapToGrid.PROPERTY_GRID_VISIBLE, Preferences.isGridVisible());
        
        // Grid Enabled
        getGraphicalViewer().setProperty(SnapToGrid.PROPERTY_GRID_ENABLED, Preferences.isGridSnap());

        // Snap to Guidelines
        getGraphicalViewer().setProperty(SnapToGeometry.PROPERTY_SNAP_ENABLED, Preferences.doShowGuideLines());
    }

    /**
     * Create the PaletteViewerProvider.
     * Over-ride this so we can hook into the creation of the PaletteViewer.
     */
    @Override
    protected PaletteViewerProvider createPaletteViewerProvider() {
        // Ensure palette is showing or not
        boolean showPalette = Preferences.doShowPalette();
        getPalettePreferences().setPaletteState(showPalette ? FlyoutPaletteComposite.STATE_PINNED_OPEN : FlyoutPaletteComposite.STATE_COLLAPSED);

        return new PaletteViewerProvider(getEditDomain()) {
            @Override
            protected void hookPaletteViewer(PaletteViewer viewer) {
                super.hookPaletteViewer(viewer);
                AbstractDiagramEditor.this.configurePaletteViewer(viewer);
            }
        };
    }
    
    /**
     * Configure the Palette Viewer
     */
    protected void configurePaletteViewer(final PaletteViewer viewer) {
        // Register as drag source to drag onto the canvas
        viewer.addDragSourceListener(new TemplateTransferDragSourceListener(viewer));

        /*
         * Tool Changed
         */
        viewer.addPaletteListener(new PaletteListener() {
            @Override
            public void activeToolChanged(PaletteViewer palette, ToolEntry toolEntry) {
                CreationFactory factory = (CreationFactory)toolEntry.getToolProperty(CreationTool.PROPERTY_CREATION_FACTORY);
                if(factory != null) {
                    ComponentSelectionManager.INSTANCE.fireSelectionEvent(toolEntry, factory.getObjectType());
                }
            }
        });
        
        /*
         * Mouse Hover
         */
        viewer.getControl().addMouseTrackListener(new MouseTrackAdapter() {
            @Override
            public void mouseHover(MouseEvent e) {
                ToolEntry toolEntry = findToolEntryAt(viewer, new Point(e.x, e.y));
                if(toolEntry != null) {
                    CreationFactory factory = (CreationFactory)toolEntry.getToolProperty(CreationTool.PROPERTY_CREATION_FACTORY);
                    if(factory != null) {
                        ComponentSelectionManager.INSTANCE.fireSelectionEvent(toolEntry, factory.getObjectType());
                    }
                }
            }
        });
        
        viewer.getControl().addMouseListener(new MouseAdapter() {
            /*
             * If Shift key is pressed set Tool Entry to unload or not
             */
            @Override
            public void mouseDown(MouseEvent e) {
                ToolEntry toolEntry = findToolEntryAt(viewer, new Point(e.x, e.y));
                if(toolEntry != null) {
                    boolean shiftKey = (e.stateMask & SWT.SHIFT) != 0;
                    toolEntry.setToolProperty(AbstractTool.PROPERTY_UNLOAD_WHEN_FINISHED, !shiftKey);
                }
            }
            
            /*
             * Double-click on Format Painter
             */
            @Override
            public void mouseDoubleClick(MouseEvent e) {
                ToolEntry toolEntry = findToolEntryAt(viewer, new Point(e.x, e.y));
                if(toolEntry instanceof FormatPainterToolEntry) {
                    FormatPainterInfo.INSTANCE.reset();
                }
            }
        });
    }
    
    /**
     * Find a Tool Entry on the palette at point, or return null
     */
    private ToolEntry findToolEntryAt(PaletteViewer viewer, Point pt) {
        EditPart ep = viewer.findObjectAt(pt);
        if(ep != null && ep.getModel() instanceof ToolEntry) {
            return (ToolEntry)ep.getModel();
        }
        return null;
    }

    @Override
    public void commandStackChanged(EventObject event) {
        super.commandStackChanged(event);
        updateCommandStackActions(); // Need to update these too
        setDirty(getCommandStack().isDirty());
    }
    
    /**
     * Update those actions that need updating when the Command Stack changes
     */
    protected void updateCommandStackActions() {
        // If not the active editor, ignore changed.
        if(this.equals(getSite().getPage().getActiveEditor())) {
            for(UpdateAction action : getUpdateCommandStackActions()) {
                action.update();
            }
        }
    }
    
    protected List<UpdateAction> getUpdateCommandStackActions() {
        return fUpdateCommandStackActions;
    }
    
    @Override
    public void doSave(IProgressMonitor monitor) {
        // Save happens in SaveAction class
    }

    @Override
    public void doSaveAs() {
    }

    @Override
    public boolean isSaveAsAllowed() {
        return false;
    }

    protected void setDirty(boolean dirty) {
        firePropertyChange(IEditorPart.PROP_DIRTY);
    }

    @Override
    public boolean isSaveOnCloseNeeded() {
        return false;
    }
    
    /**
     * Add some extra Actions - *after* the graphical viewer has been created
     */
    @SuppressWarnings("unchecked")
    protected void createActions(GraphicalViewer viewer) {
        ActionRegistry registry = getActionRegistry();
        IAction action;
        
        // Zoom Manager tweaking
        ZoomManager zoomManager = (ZoomManager)getAdapter(ZoomManager.class);
        double[] zoomLevels = { .25, .5, .75, 1.0, 1.5, 2.0, 2.5, 3, 4 };
        zoomManager.setZoomLevels(zoomLevels);
        List<String> zoomContributionLevels = new ArrayList<String>();
        zoomContributionLevels.add(ZoomManager.FIT_ALL);
        zoomContributionLevels.add(ZoomManager.FIT_WIDTH);
        zoomContributionLevels.add(ZoomManager.FIT_HEIGHT);
        zoomManager.setZoomLevelContributions(zoomContributionLevels);
        
        // Zoom Actions
        IAction zoomIn = new ZoomInAction(zoomManager);
        IAction zoomOut = new ZoomOutAction(zoomManager);
        registry.registerAction(zoomIn);
        registry.registerAction(zoomOut);
        
        // Add these zoom actions to the key binding service
        IHandlerService service = (IHandlerService)getEditorSite().getService(IHandlerService.class);
        service.activateHandler(zoomIn.getActionDefinitionId(), new ActionHandler(zoomIn));
        service.activateHandler(zoomOut.getActionDefinitionId(), new ActionHandler(zoomOut));
     
        // Add our own Select All Action so we can select connections as well
        action = new SelectAllAction(this);
        registry.registerAction(action);
        
        // Add our own Print Action
        action = new PrintDiagramAction(this);
        registry.registerAction(action);
        
        // Direct Edit Rename
        action = new DirectEditAction(this);
        action.setId(ActionFactory.RENAME.getId()); // Set this for Global Handler
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        
        // Change the Delete Action label
        action = registry.getAction(ActionFactory.DELETE.getId());
        action.setText("&Delete from View");
        action.setToolTipText(action.getText());
        
        // Paste
        PasteAction pasteAction = new PasteAction(this, viewer);
        registry.registerAction(pasteAction);
        getSelectionActions().add(pasteAction.getId());
        
        // Cut
        action = new CutAction(this, pasteAction);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        
        // Copy
        action = new CopyAction(this, pasteAction);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        
        // Use Grid Action
        action = new ToggleGridEnabledAction();
        registry.registerAction(action);
        
        // Show Grid Action
        action = new ToggleGridVisibleAction();
        registry.registerAction(action);
        
        // Snap to Alignment Guides
        action = new ToggleSnapToAlignmentGuidesAction();
        registry.registerAction(action);
        
        // Ruler
        //IAction showRulers = new ToggleRulerVisibilityAction(getGraphicalViewer());
        //registry.registerAction(showRulers);
        
        action = new MatchWidthAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        
        action = new MatchHeightAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        action = new AlignmentAction((IWorkbenchPart)this, PositionConstants.LEFT);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        action = new AlignmentAction((IWorkbenchPart)this, PositionConstants.RIGHT);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        action = new AlignmentAction((IWorkbenchPart)this, PositionConstants.TOP);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        action = new AlignmentAction((IWorkbenchPart)this, PositionConstants.BOTTOM);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        action = new AlignmentAction((IWorkbenchPart)this, PositionConstants.CENTER);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        action = new AlignmentAction((IWorkbenchPart)this, PositionConstants.MIDDLE);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        
        action = new DefaultEditPartSizeAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        getUpdateCommandStackActions().add((UpdateAction)action);
        
        // Properties
        action = new PropertiesAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        
        // Fill Colour
        action = new FillColorAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        
        // Connection Line Width
        action = new ConnectionLineWidthAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        
        // Connection Line Color
        action = new ConnectionLineColorAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        // Font
        action = new FontAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        // Font Colour
        action = new FontColorAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());

        // Export As Image
        action = new ExportAsImageAction(viewer);
        registry.registerAction(action);
        
        // Export As Image to Clipboard
        action = new ExportAsImageToClipboardAction(viewer);
        registry.registerAction(action);
        
        // Connection Router types
        action = new ConnectionRouterAction.BendPointConnectionRouterAction(this);
        registry.registerAction(action);
        action = new ConnectionRouterAction.ShortestPathConnectionRouterAction(this);
        registry.registerAction(action);
        action = new ConnectionRouterAction.ManhattanConnectionRouterAction(this);
        registry.registerAction(action);
        
        // Send Backward
        action = new SendBackwardAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        getUpdateCommandStackActions().add((UpdateAction)action);
        
        // Bring Forward
        action = new BringForwardAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        getUpdateCommandStackActions().add((UpdateAction)action);
        
        // Send to Back
        action = new SendToBackAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        getUpdateCommandStackActions().add((UpdateAction)action);
        
        // Bring To Front
        action = new BringToFrontAction(this);
        registry.registerAction(action);
        getSelectionActions().add(action.getId());
        getUpdateCommandStackActions().add((UpdateAction)action);
        
        // Text Alignment Actions
        for(TextAlignmentAction a : TextAlignmentAction.createActions(this)) {
            registry.registerAction(a);
            getSelectionActions().add(a.getId());
            getUpdateCommandStackActions().add(a);
        }
        
        // Full Screen
        action = new FullScreenAction(this);
        registry.registerAction(action);
    }
    
    @Override
    public String getContributorId() {
        return ArchimateEditorPlugin.PLUGIN_ID;
    }

    @SuppressWarnings("rawtypes")
    @Override
    public Object getAdapter(Class adapter) {
        /*
         * Return the Zoom Manager
         */
        if(adapter == ZoomManager.class && getGraphicalViewer() != null) {
            return getGraphicalViewer().getProperty(ZoomManager.class.toString());
        }

        /*
         * Return the singleton Outline Page
         */
        if(adapter == IContentOutlinePage.class && getGraphicalViewer() != null) {
            return new OverviewOutlinePage(this);
        }
        
        /*
         * Return the Property Sheet Page
         */
        if(adapter == IPropertySheetPage.class) {
            return new TabbedPropertySheetPage(this);
        }

        /*
         * Return the Archimate Model
         * DO NOT REMOVE! SaveAction requires this
         */
        if(adapter == IArchimateModel.class && getModel() != null) {
            return getModel().getArchimateModel();
        }
        
        /*
         * Return the Diagram Model
         */
        if(adapter == IDiagramModel.class) {
            return getModel();
        }

        return super.getAdapter(adapter);
    }
    
    /**
     * The eCore Model changed
     * @param msg
     */
    protected void eCoreModelChanged(Notification msg) {
        if(msg.getEventType() == Notification.SET) {
            // Archimate Model or Diagram Model name changed
            if(msg.getNotifier() == getModel() || msg.getNotifier() == getModel().getArchimateModel()) {
                if(msg.getFeature() == IArchimatePackage.Literals.NAMEABLE__NAME) {
                    setPartName(getEditorInput().getName());
                }
            }
        }
    }
    
    @Override
    public void dispose() {
        super.dispose();
        
        // Remove listeners
        Preferences.STORE.removePropertyChangeListener(appPreferencesListener);
        
        if(getModel() != null && getModel().getArchimateModel() != null) {
            getModel().getArchimateModel().eAdapters().remove(eCoreAdapter);
        }
    }
    
    
    // -----------------------------------------------------------------------------------------------------------
    // Monkey Patch for Bug 321560
    // https://bugs.eclipse.org/bugs/show_bug.cgi?id=321560
    // TODO Remove this patch when fixed
    // -----------------------------------------------------------------------------------------------------------
    
    
    /**
     * Bug 321560 - [Palette] Using GTK, resizing palette does not work well and
     * loose keyboard: https://bugs.eclipse.org/bugs/show_bug.cgi?id=321560
     * <ul>
     * <li>Platform: Linux GTK
     * <li>Version: >= 3.5.2
     * <p>
     * The fix consists in removing the FlyoutComposite#Sash#SashDragManager and
     * replacing it with running the FlyoutComposite#ResizeAction. We remove the
     * SashDragManager by removing mouse and mouseMove listeners from sash. We
     * find the reference to ResizeAction by inspecting the context menu of the
     * title part in paletteContainer.
     */
    private void fixBug321560() {
        if(PlatformUtils.isGTK() && SWT.getVersion() >= 3520) {
            try {
                final Composite splitter = (Composite)getPrivateFieldValue(this, GraphicalEditorWithFlyoutPalette.class, "splitter");
                Control[] children = splitter.getChildren();
                Control sash = children[0];
                Composite paletteContainer = (Composite)children[1];

                Control[] paletteChildren = paletteContainer.getChildren();
                Control title = paletteChildren[0];

                Menu contextMenu = title.getMenu();
                Listener[] listeners = getListeners(contextMenu, SWT.Show);

                Object innerListener = listeners[0];
                if(innerListener instanceof TypedListener) {
                    innerListener = ((TypedListener)innerListener).getEventListener();
                }

                IMenuManager mgr = (IMenuManager)getPrivateFieldValue(innerListener, innerListener.getClass(), "this$0");

                final IAction resizeAction = ((ActionContributionItem)mgr.getItems()[0]).getAction();
                if(resizeAction == null) {
                    return;
                }

                // Apply the hack at the very end. This makes sure that the code
                // above can fail without side effects:

                // remove Mouse and MouseMove listeners
                removeListeners(sash, SWT.MouseMove);
                removeListeners(sash, SWT.MouseUp);
                removeListeners(sash, SWT.MouseDown);
                removeListeners(sash, SWT.MouseDoubleClick);

                // Add our own mouseDown listener that runs the ResizeAction
                sash.addListener(SWT.MouseDown, new Listener() {
                    public void handleEvent(Event event) {
                        if(resizeAction.isEnabled()) {
                            resizeAction.run();
                        }
                    }
                });
            }
            catch(Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    private Object getPrivateFieldValue(Object object, Class<?> cls, String string) throws Exception {
        Field f = cls.getDeclaredField(string);
        f.setAccessible(true);
        return f.get(object);
    }

    private void removeListeners(Control control, int eventType) throws Exception {
        Listener[] listeners = getListeners(control, eventType);
        for(int i = 0; i < listeners.length; i++) {
            control.removeListener(eventType, listeners[i]);
        }
    }

    private Listener[] getListeners(Widget w, int eventType) throws Exception {
        Method method = w.getClass().getMethod("getListeners", int.class);
        return (Listener[])method.invoke(w, eventType);
    }
}
