// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import IconButton from '@material-ui/core/IconButton';
import Zoom from '@material-ui/core/Zoom';

import AppBar from '@material-ui/core/AppBar';
import { Shake } from 'reshake';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import SwipeableViews from 'react-swipeable-views';
import { kea, connect } from 'kea';
import { Control, Form, actions, Field } from 'react-redux-form';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Select from '@material-ui/core/Select';
import Tooltip from '@material-ui/core/Tooltip';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import Avatar from '@material-ui/core/Avatar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

import Snackbar from '@material-ui/core/Snackbar';
import { ipcRenderer } from 'electron';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('graceful-fs'));
// const fs = require('graceful-fs');
const ini = require('ini');
const path = require('path');

const electronStore = require('electron-store');

const eStore = new electronStore();

type Props = {};
const styles = (theme) => ({
  root: {
    flexGrow: 1
  },
  input: {
    display: 'none'
  },
  fab: {
    position: 'absolute',
    top: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2
  },
  paper: {
    height: 140,
    width: 100
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  control: {
    padding: theme.spacing.unit * 2
  }
});

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}
const steps = [
  {
    title: 'Quick overview to get you started',
    text:
      '<ul >' +
      '<li style="list-style:circle">Choose where ANA executable is located</li>' +
      '<li style="list-style:circle">Each analysis has its own file requirements</li>' +
      '<li style="list-style:circle">Save your configuration for next time</li>' +
      '</ul>',
    selector: '#present',
    position: 'top',
    type: 'hover',
    style: {
      header: {
        color: '#f04',
        fontSize: '18px',
        textAlign: 'center'
      },
      footer: {
        display: 'none'
      },
      beacon: {
        inner: '#000',
        outer: '#000'
      }
    }
  }
];
// Static y Molecular Output PDB
// Add SAVE CONFIG abajo en el form Elige archivo y guarda
const keaOptions = {
  connect: {
    // actions: [keaFormComponent, ["setValue", "submit"]],
    props: [(state) => state.configuration, ['* as configurationForm']]
  }
};
class Home extends Component<Props> {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
      dialogOpen: false,
      snackbarOpen: false,
      ana_execute_results: null,
      anaConfigStatus: {
        location: false
      }
    };
    this.handleSnackbarOpen = this.handleSnackbarOpen.bind(this);
  }
  componentDidMount = () => {
    this.props.context.addSteps(steps);
    this.checkValidAnaPath();
    ipcRenderer.on('ana-path', (event) => {
      // store.dispatch({ type: 'OPEN_FILE' });
      console.log('ana Path click');
      this.showFileDialog('configuration.ana_path', ['*'], 'Any File');
    });
    ipcRenderer.on('clearCache', (event) => {
      // store.dispatch({ type: 'OPEN_FILE' });
      console.log('Clear Cache');
      eStore.clear();
    });
  };
  checkValidAnaPath = () => {
    const currentAnaPath = eStore.get('configuration.ana_path');

    if (currentAnaPath != undefined) {
      if (fs.existsSync(currentAnaPath)) {
        console.log('ANA File Existis', currentAnaPath);
        this.setState({ anaConfigStatus: { location: true } });
        this.props.dispatch(actions.change('configuration.ana_path', currentAnaPath));
      } else {
        console.log('ANA File Missing, Reset', currentAnaPath);
        eStore.delete('configuration.ana_path');
        this.setState({ anaConfigStatus: { location: false } });
      }
    } else {
      this.props.context.startJoyride();
      this.handleSnackbarOpen();
    }
  };

  handleSnackbarOpen = () => {
    console.log('Opening Snackbar');
    this.setState({ snackbarOpen: true });
  };
  handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ snackbarOpen: false });
  };
  handleDialogOpen = () => {
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };
  handleFixAnaPath = () => {
    this.handleSnackbarClose();
    this.showFileDialog('configuration.ana_path', ['*'], 'Any File');
  };

  executeANA = () => {
    const child = require('child_process').execFile;
    const executablePath = this.props.configurationForm.ana_path;

    const pdbDirname = this.props.configurationForm.pdb_file_upload.match(/(.*)[\/\\]/)[1] || '';
    const pdbFilename = this.props.configurationForm.pdb_file_upload.replace(/^.*[\\\/]/, '');
    const dynamicFilename = this.props.configurationForm.dynamic_file_upload;
    const outputFilename = this.props.configurationForm.output_file;
    const nddOutputFilename = this.props.configurationForm.ndd_output_file;
    const nddInputFilename = this.props.configurationForm.ndd_input_file_upload;
    // const outputFilename = `${dirname}/${pdbFilename}.txt`;
    const processExecResults = (err, stdout, stderr) => {
      console.log(err);
      console.log(stdout.toString());
      console.log(stderr);
      this.setState({ ana_execute_results: stdout.toString() });
      this.handleDialogOpen();
    };
    const parameters = [
      this.props.configurationForm.pdb_file_upload,
      `-c ${this.props.configurationForm.config_file_upload}`
    ];

    // FIRST SAVE THE CURRENT CONFIG
    this.saveConfigToFile();
    if (this.state.currentTab == 0) {
      // Static
      parameters.push(` -o ${outputFilename} `);
    } else if (this.state.currentTab == 1) {
        parameters.push(` -o ${outputFilename} `);
        parameters.push(` -d ${dynamicFilename} `);
      // MD
    } else if (this.state.currentTab == 1) {
      // MD --NDD_input=in_ndd_1M14_A --NDD_output=out_ndd
      parameters.push(` --NDD_output=${nddOutputFilename} `);
      parameters.push(` --NDD_input=${nddInputFilename} `);
    } else {
      console.error("Current TAB not defined, I don't know what to run");
      return false;
    }

    child(executablePath, parameters, { cwd: pdbDirname, shell: true }, (err, data) => {
      processExecResults(err, data);
    });
  };

  showFileDialog = (modelName, extensions, extensionsTitle) => {
    const { dialog } = require('electron').remote;
    const filters = [{ name: extensionsTitle, extensions }];
    const value = dialog.showOpenDialog({
      filters,
      properties: ['openFile', 'multiSelections']
    });
    if (value != undefined) {
      eStore.set(modelName, value[0]);
      this.checkValidAnaPath(); // TODO: only call this method once
      this.props.dispatch(actions.change(modelName, value[0]));
      if (modelName == 'configuration.config_file_upload') {
        // We need to read the config file and parse it
        const config = ini.parse(fs.readFileSync(value[0], 'utf-8'));
        console.log('Reading new config!', config);
        this.props.dispatch(actions.merge('configuration', config));
      }
    }
  };
  showSaveFileDialog = (modelName) => {
    const { dialog } = require('electron').remote;
    const value = dialog.showOpenDialog((fileName)=>{
        if (fileName === undefined){
        console.log("You didn't save the file");
        return;
    }
        // fileName is a string that contains the path and filename created in the save file dialog.
        if (fileName[0] != undefined) {
          eStore.set(modelName, fileName[0]);
          this.checkValidAnaPath(); // TODO: only call this method once
          this.props.dispatch(actions.change(modelName, fileName[0]));

        }
    });

  };
  saveConfigToFile = () => {
    const configurationFormClone = Object.assign({}, this.props.configurationForm);
    delete configurationFormClone.config_file_upload;
    delete configurationFormClone.ana_path;
    delete configurationFormClone.pdb_file_upload;
    fs.writeFileSync(
      `${this.props.configurationForm.pdb_file_upload}.cfg`,
      ini.stringify(configurationFormClone)
    );
  };
  handleTabChange = (event, currentTab) => {
    this.setState({ currentTab });
  };
  // This is currying - a function that returns a function.
  handleChange = ({ model, dispatch }, options = {}) => (ev, index, value) => {
    console.log(ev.target.value);
    if (value == undefined) {
      value = ev.target.value;
    }
    console.log(value);
    dispatch(actions.change(model, value, options));
    const context = this; // eslint-disable-line consistent-this
  };
  testIniConfig = () => {
    const remote = require('electron').remote;
    let documentsPath = remote.app.getPath('documents');
    console.log('appPath: documents 3', documentsPath);

    documentsPath = path.join(documentsPath, '/config.ini');
    fs.writeFile(documentsPath, '', { flag: 'wx' }, (err) => {
      if (err) {
        const config = ini.parse(fs.readFileSync(documentsPath, 'utf-8'));
        console.log("It's saved!", config);
      } else {
        const config = {};
        const arreglito = [132, 123, 454, 7687, 989];
        config.string = 'local';
        config.int = 99;
        config.float = 8978123.123123;
        config.arreglito = arreglito.join(' ');
        fs.writeFileSync(documentsPath, ini.stringify(config));
      }
    });
  };

  render() {
    const { classes, fullScreen, theme } = this.props;
    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: theme.transitions.duration.leavingScreen
    };
    const pdbFilename =
      this.props.configurationForm.pdb_file_upload == undefined
        ? ''
        : this.props.configurationForm.pdb_file_upload.replace(/^.*[\\\/]/, ''); // Add this function to show only the file name  .replace(/^.*[\\\/]/, '');
    const configFilename =
      this.props.configurationForm.config_file_upload == undefined
        ? ''
        : this.props.configurationForm.config_file_upload.replace(/^.*[\\\/]/, '');
    const dynamicFileName =
      this.props.configurationForm.dynamic_file_upload == undefined
        ? ''
        : this.props.configurationForm.dynamic_file_upload.replace(/^.*[\\\/]/, '');
    const nddOutputFile =
      this.props.configurationForm.ndd_output_file == undefined
        ? ''
        : this.props.configurationForm.ndd_output_file.replace(/^.*[\\\/]/, '');
    const nddInputFile =
      this.props.configurationForm.ndd_input_file_upload == undefined
        ? ''
        : this.props.configurationForm.ndd_input_file_upload.replace(/^.*[\\\/]/, '');
    const outputFilename =
      this.props.configurationForm.output_file == undefined
        ? ''
        : this.props.configurationForm.output_file.replace(/^.*[\\\/]/, '');
    return (
      <Grid container className={classes.root}>
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={this.state.snackbarOpen}
                onClose={this.handleSnackbarClose}
                SnackbarContentProps={{
                  'aria-describedby': 'message-id'
                }}
                message={
                  <span id="message-id">
                    Your ANA path is missing - GUI will not be able to run your dynamic
                  </span>
                }
                action={
                  <Button color="secondary" size="small" onClick={this.handleFixAnaPath}>
                    Fix
                  </Button>
                }
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Tabs
            value={this.state.currentTab}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Static " />
            <Tab label="Molecular Dynamics" />
            <Tab label="Non-Delauny Dynamics" />
          </Tabs>
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="baseline">
            <Grid item xs={12}>
              <Paper className={classes.control}>
                <Grid container alignItems="baseline">
                  <Grid item xs="4">
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Button
                            color="default"
                            variant="flat"
                            id="raised-button-file"
                            component="span"
                            onClick={() =>
                              this.showFileDialog(
                                'configuration.pdb_file_upload',
                                ['pdb'],
                                'PDB Files'
                              )
                            }
                          >
                            {this.props.configurationForm.pdb_file_upload == undefined ? (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'left',
                                  color: 'rgb(249, 81, 81)'
                                }}
                              >
                                <i className="material-icons">file_upload</i>
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                <i className="material-icons">file_upload</i>
                              </div>
                            )}
                          </Button>
                        </ListItemAvatar>
                        {this.props.configurationForm.pdb_file_upload == undefined ? (
                          <ListItemText primary="Load PDB" secondary={pdbFilename || null} />
                        ) : (
                            <ListItemText primary="PDB Loaded" secondary={pdbFilename || null} />
                        )}
                        <ListItemSecondaryAction>
                          {this.props.configurationForm.pdb_file_upload == undefined ? null : (
                            <i className="material-icons" style={{ color: '#52a647' }}>
                              check
                            </i>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Button
                            color="default"
                            variant="flat"
                            component="span"
                            onClick={() =>
                              this.showFileDialog(
                                'configuration.config_file_upload',
                                ['cfg'],
                                'Config File'
                              )
                            }
                            className={classes.button}
                          >
                            {this.props.configurationForm.config_file_upload == undefined ? (
                              <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                <i className="material-icons">file_upload</i>
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                <i className="material-icons">file_upload</i>
                              </div>
                            )}
                          </Button>
                        </ListItemAvatar>
                        {this.props.configurationForm.config_file_upload == undefined ? (
                          <ListItemText primary="Load Config" secondary={configFilename || null} />
                        ) : (
                            <ListItemText primary="Config Loaded" secondary={configFilename || null} />
                        )}
                        <ListItemSecondaryAction>
                          {this.props.configurationForm.config_file_upload == undefined ? null : (
                            <i
                              className="material-icons"
                              style={{ color: '#52a647', paddingLeft: 10 }}
                            >
                              check
                            </i>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                            <Button
                              color="default"
                              variant="flat"
                              component="span"
                              onClick={() =>
                                this.showSaveFileDialog('configuration.output_file')
                              }
                              className={classes.button}
                            >
                                {this.props.configurationForm.output_file == undefined ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                    <i className="material-icons">save</i>
                                  </div>
                                ) : (
                                    <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                      <i className="material-icons" >
                                        save
                                      </i>
                                    </div>
                                )}
                            </Button>
                        </ListItemAvatar>
                        {this.props.configurationForm.output_file == undefined ? (
                          <ListItemText primary="Output File" secondary={nddOutputFile || null} />
                        ) : (
                          <ListItemText primary="Output Defined" secondary={nddOutputFile || null} />
                        )}

                        <ListItemSecondaryAction>
                          {this.props.configurationForm.output_file == undefined ? null : (
                            <i
                              className="material-icons"
                              style={{ color: '#52a647', paddingLeft: 10 }}
                            >
                              check
                            </i>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Grid>
                  {this.state.currentTab == 1 ? (
                  <Grid item xs="4">
                      <List dense>
                        <ListItem>
                          <ListItemAvatar>
                              <Button
                                color="default"
                                variant="flat"
                                component="span"
                                onClick={() =>
                                  this.showFileDialog(
                                    'configuration.dynamic_file_upload',
                                    ['nc', 'trr', 'trj', 'xtc'],
                                    'Dynamic File'
                                  )
                                }
                                className={classes.button}
                              >
                                {this.props.configurationForm.dynamic_file_upload == undefined ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                    <i className="material-icons">
                                      file_upload
                                    </i>
                                  </div>
                                ) : (
                                  <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                    <i className="material-icons" >
                                      file_upload
                                    </i>
                                  </div>
                                )}
                              </Button>
                          </ListItemAvatar>
                          {this.props.configurationForm.dynamic_file_upload == undefined ? (
                            <ListItemText primary="Load Dynamic" secondary={dynamicFileName || null} />
                          ) : (
                            <ListItemText primary="Dynamic Loaded" secondary={dynamicFileName || null} />
                          )}

                          <ListItemSecondaryAction>
                            {this.props.configurationForm.dynamic_file_upload == undefined ? null : (
                              <i className="material-icons" style={{ color: '#52a647' }}>
                                check
                              </i>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>

                      </List>
                  </Grid>
              ) : (
                  ''
              )}
              {this.state.currentTab == 2 ? (
                  <Grid item xs="4">
                      <List dense>
                        <ListItem>
                          <ListItemAvatar>
                                <Button
                                  color="default"
                                  variant="flat"
                                  id="raised-button-file"
                                  component="span"
                                  onClick={() =>
                                    this.showFileDialog('configuration.ndd_output_file', ['*'], 'Any File')
                                  }
                                  className={classes.button}
                                >
                                  {this.props.configurationForm.ndd_output_file == undefined ? (
                                    <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                      <i className="material-icons">save</i>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                      <i className="material-icons">save</i>
                                    </div>
                                  )}
                                </Button>
                          </ListItemAvatar>
                          <ListItemText primary="NDD Output" secondary={nddOutputFile || null} />
                          <ListItemSecondaryAction>
                            {this.props.configurationForm.ndd_output_file == undefined ? null : (
                              <i className="material-icons" style={{ color: '#52a647' }}>
                                check
                              </i>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                              <Button
                                color="default"
                                variant="flat"
                                id="raised-button-file"
                                component="span"
                                onClick={() =>
                                  this.showFileDialog(
                                    'configuration.ndd_input_file_upload',
                                    ['*'],
                                    'Any File'
                                  )
                                }
                                className={classes.button}
                              >
                                {this.props.configurationForm.ndd_input_file_upload == undefined ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                    <i className="material-icons">file_upload</i>
                                  </div>
                                ) : (
                                  <div style={{ display: 'inline-flex', alignItems: 'left' }}>
                                    <i className="material-icons">file_upload</i>
                                  </div>
                                )}
                              </Button>
                          </ListItemAvatar>
                          <ListItemText primary="NDD Input" secondary={configFilename || null} />
                          <ListItemSecondaryAction>
                            {this.props.configurationForm.config_file_upload == undefined ? null : (
                              <i
                                className="material-icons"
                                style={{ color: '#52a647', paddingLeft: 10 }}
                              >
                                check
                              </i>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                  </Grid>
              ) : (
                  ''
              )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          <SwipeableViews
            axis="x"
            index={this.state.currentTab}
            onChangeIndex={this.handleChangeIndex}
          >
            <TabContainer>
              <Grid container alignItems="baseline">
                <Grid item xs={12}>
                  <Typography align="center" variant="headline">
                    Included Area
                  </Typography>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    style={{ minWidth: '90%' }}
                    component={TextField}
                    model="configuration.included_area_residues"
                    id="included_area_residues"
                    label="included_area_residues"
                    helperText="Comma separated values"
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Grid container alignItems="baseline">
                <Grid item xs={9}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    style={{ minWidth: '90%' }}
                    component={TextField}
                    model="configuration.included_area_atoms"
                    id="included_area_atoms"
                    label="included_area_atoms"
                    helperText="Comma separated values"
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={3}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    className={classes.formControl}
                    label="Area Precision"
                    handleChange={this.handleChange}
                    data={included_area_precisionOptions}
                    helperText="Method"
                    autoWidth
                    model="configuration.included_area_precision"
                  />
                </Grid>
              </Grid>
              <Grid container alignItems="baseline">
                <Grid item xs={12}>
                  <Typography align="center" variant="headline">
                    Accessible Surface Area
                  </Typography>
                </Grid>

                <Grid item xs={4}>
                  <Tooltip title="NONE: don't discard; cm: determine cells surroundings using the global CM as reference;  backbone: draw a convex hull between the Calphas and discard every cell with its centroid outside(inside) the hull;  axes: determine cells surroundings using its centroid and cartesian axes as references. Default value: cm.">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    helperText=""
                    label="ASA_discard_methodOptions"
                    handleChange={this.handleChange}
                    data={ASA_discard_methodOptions}
                    defaultValue="cm"
                    model="configuration.ASA_discard_method"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    helperText=""
                    label="ASA_only_side"
                    handleChange={this.handleChange}
                    data={ASA_only_sideOptions}
                    model="configuration.ASA_only_side"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    component={TextField}
                    model="configuration.ASA_exclude_residues"
                    id="ASA_exclude_residues"
                    label="ASA_exclude_residues"
                    helperText="Don't use these to discard ASA cells."
                    className={classes.textField}
                    margin="normal"
                    defaultValue="none"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="Minimum dot product to keep(discard) cell. As it increases more cells are classified as being outside.">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    component={TextField}
                    model="configuration.ASA_min_dot_pdt"
                    id="ASA_min_dot_pdt"
                    label="ASA_min_dot_pdt"
                    helperText="integer"
                    defaultValue="0.7"
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    component={TextField}
                    model="configuration.ASA_max_dist"
                    id="ASA_max_dist"
                    label="ASA_max_dist"
                    helperText="integer"
                    defaultValue="15"
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Grid container alignItems="baseline">
                <Grid item xs={12}>
                  <Typography align="center" variant="headline">
                    Clusters
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    helperText=""
                    autoWidth
                    label="clusters_method"
                    handleChange={this.handleChange}
                    data={clusters_methodOptions}
                    defaultValue="boxes"
                    model="configuration.clusters_method"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    component={TextField}
                    model="configuration.cluster_min_size"
                    id="cluster_min_size"
                    label="cluster_min_size"
                    helperText="Integer"
                    className={classes.textField}
                    margin="normal"
                    defaultValue="2"
                  />
                </Grid>
              </Grid>
            </TabContainer>
            <TabContainer>
              <Grid container alignItems="baseline">
                <Grid item xs={12}>
                  <Typography align="center" variant="headline">
                    Included Area
                  </Typography>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    style={{ minWidth: '90%' }}
                    component={TextField}
                    model="configuration.included_area_residues"
                    id="included_area_residues"
                    label="included_area_residues"
                    helperText="Comma separated values"
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Grid container alignItems="baseline">
                <Grid item xs={9}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    style={{ minWidth: '90%' }}
                    component={TextField}
                    model="configuration.included_area_atoms"
                    id="included_area_atoms"
                    label="included_area_atoms"
                    helperText="Comma separated values"
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={3}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    className={classes.formControl}
                    label="Area Precision"
                    handleChange={this.handleChange}
                    data={included_area_precisionOptions}
                    helperText="Method"
                    autoWidth
                    model="configuration.included_area_precision"
                  />
                </Grid>
              </Grid>
            </TabContainer>
            <TabContainer>
              <Grid container alignItems="baseline">
                <Grid item xs={12}>
                  <Typography align="center" variant="headline">
                    Included Area
                  </Typography>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    style={{ minWidth: '90%' }}
                    component={TextField}
                    model="configuration.included_area_residues"
                    id="included_area_residues"
                    label="included_area_residues"
                    helperText="Comma separated values"
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Grid container alignItems="baseline">
                <Grid item xs={9}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    style={{ minWidth: '90%' }}
                    component={TextField}
                    model="configuration.included_area_atoms"
                    id="included_area_atoms"
                    label="included_area_atoms"
                    helperText="Comma separated values"
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={3}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i
                      style={{ fontSize: '12px', color: 'grey', marginRight: '5px' }}
                      className="material-icons"
                    >
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    className={classes.formControl}
                    label="Area Precision"
                    handleChange={this.handleChange}
                    data={included_area_precisionOptions}
                    helperText="Method"
                    autoWidth
                    model="configuration.included_area_precision"
                  />
                </Grid>
              </Grid>
            </TabContainer>
          </SwipeableViews>
        </Grid>
        <Zoom
          key={1}
          in
          timeout={200}
          style={{
            transitionDelay: true ? transitionDuration.exit : 0
          }}
          unmountOnExit
        >
          <Tooltip title="RUN ANA">
            <Button
              variant="fab"
              color={this.props.configurationForm.ana_path == undefined ? 'default' : 'secondary'}
              id="raised-button-file"
              component="span"
              onClick={() => this.executeANA()}
              className={classes.fab}
            >
              <i className="material-icons" style={{ fontSize: 30, paddingLeft: 0 }}>
                play_circle_outline
              </i>
            </Button>
          </Tooltip>
        </Zoom>
        <Dialog
          fullScreen={fullScreen}
          open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Execution Results</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Typography
                variant="body2"
                gutterBottom
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
              >
                {this.state.ana_execute_results}
              </Typography>
              <Typography
                variant="body2"
                gutterBottom
                style={{ fontStyle: 'italic', fontSize: '11px', marginTop: '30px' }}
              >
                ANA output was written to: {outputFilename}.pdb
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    );
  }
}
const SelectComponent = ({
  handleChange, model, data, label, helperText, className, ...props
}) => (
  <FormControl className={className}>
    <InputLabel htmlFor={model}>{label}</InputLabel>
    <Control.select
      model={model}
      id={model}
      autoWidth
      component={Select}
      mapProps={{
        value: (props) => {
          if (props.modelValue == undefined) {
            return 'none';
          }
          return props.modelValue;
        }
      }}
      onChange={handleChange}
      {...props}
    >
      {data.map((child, index) => (
        <MenuItem key={index} value={child.value}>
          {child.text}
        </MenuItem>
      ))}
    </Control.select>
    <FormHelperText>{helperText} </FormHelperText>
  </FormControl>
);
//
const output_typeOptions = [
  {
    text: 'raw_pdb',
    value: 'raw_pdb'
  },
  {
    text: 'raw_cgo',
    value: 'raw_cgo'
  },
  {
    text: 'grid_pdb',
    value: 'grid_pdb'
  },
  {
    text: 'grid_cgo',
    value: 'grid_cgo'
  }
];
const clusters_methodOptions = [
  {
    text: 'None',
    value: 'none'
  },
  {
    text: 'Facets',
    value: 'facets'
  },
  {
    text: 'Boxes',
    value: 'boxes'
  }
];
const included_area_precisionOptions = [
  {
    text: 'None',
    value: 'none'
  },
  {
    value: '0',
    text: '0'
  },
  {
    value: '1',
    text: '1'
  }
];
const ASA_discard_methodOptions = [
  {
    value: 'cm',
    text: 'CM'
  },
  {
    text: 'None',
    value: 'none'
  },
  {
    value: 'backbone',
    text: 'Backbone'
  },
  {
    value: 'axes',
    text: 'Axes'
  }
];
const ASA_only_sideOptions = [
  {
    text: 'Outside',
    value: 'outside'
  },
  {
    value: 'inside',
    text: 'Inside'
  },
  {
    value: 'backbone',
    text: 'Backbone'
  },
  {
    value: 'axes',
    text: 'Axes'
  }
];
export default kea(keaOptions)(withStyles(styles, { withTheme: true })(Home));
