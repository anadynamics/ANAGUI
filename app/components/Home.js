// @flow
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Button from "material-ui/Button";
import { withStyles } from "material-ui/styles";
import Grid from "material-ui/Grid";
import Radio, { RadioGroup } from "material-ui/Radio";
import Paper from "material-ui/Paper";
const path = require("path");
import AppBar from "material-ui/AppBar";
import { Shake } from "reshake";
import TextField from "material-ui/TextField";
import Toolbar from "material-ui/Toolbar";
import Typography from "material-ui/Typography";
import Tabs, { Tab } from "material-ui/Tabs";
import SwipeableViews from "react-swipeable-views";
import { kea, connect } from "kea";
import { Control, Form, actions, Field } from "react-redux-form";
import { FormControl, FormHelperText, FormLabel } from "material-ui/Form";
import Menu, { MenuItem } from "material-ui/Menu";
import Select from "material-ui/Select";
import Tooltip from "material-ui/Tooltip";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  withMobileDialog,
} from "material-ui/Dialog";
import Input, { InputLabel } from "material-ui/Input";
type Props = {};
const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  input: {
    display: "none",
  },
  paper: {
    height: 140,
    width: 100,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
});

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

let keaOptions = {
  connect: {
    // actions: [keaFormComponent, ["setValue", "submit"]],
    props: [
      state => {
        return state.configuration;
      },
      ["* as configurationForm"],
    ],
  },
};
class Home extends Component<Props> {
  props: Props;
  state = {
    currentTab: 0,
    dialogOpen: false,
  };
  handleDialogOpen = () => {
    this.setState({ dialogOpen: true });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  handleSubmit = (event, model) => {
    const { dispatch } = this.props;

    console.log(model);
    dispatch(actions.merge("configuration", { included_area_residues: "123", included_area_atoms: "321" }));
  };
  executeANA = () => {
    var child = require("child_process").execFile;
    var executablePath = this.props.configurationForm.ana_path;
    var parameters = [this.props.configurationForm.file_upload];
    const logA = (err, data) =>{
        console.log(err);
        console.log(data.toString());
        this.props.dispatch(actions.change("configuration.ana_execute_results", data.toString()));
        this.handleDialogOpen();
    }
    child(executablePath, parameters, function(err, data) {
      logA(err, data)
    });
  };
  showFileDialog = (modelName, extensions) => {
    const { dialog } = require("electron").remote;
    let filters = [{ name: "PDB Files", extensions: ["pdb"] }];
    if (extensions == "all") {
      filters = [{ name: "Any File", extensions: ["*"] }];
    }
    let value = dialog.showOpenDialog({
      filters: filters,
      properties: ["openFile", "multiSelections"],
    });
    if (value != undefined) {
      this.props.dispatch(actions.change(modelName, value[0]));
    }
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
    const context = this; //eslint-disable-line consistent-this
  };
  componentWillMount = () => {};
  componentWillReceiveProps = nextProps => {
    console.log(nextProps);
  };
  testIniConfig = () => {
    const remote = require("electron").remote;
    let documentsPath = remote.app.getPath("documents");
    console.log("appPath: documents 3", documentsPath);
    var fs = require("graceful-fs"),
      ini = require("ini");
    documentsPath = path.join(documentsPath, "/config.ini");
    fs.writeFile(documentsPath, "", { flag: "wx" }, function(err) {
      if (err) {
        var config = ini.parse(fs.readFileSync(documentsPath, "utf-8"));
        console.log("It's saved!", config);
      } else {
        let config = {};
        let arreglito = [132, 123, 454, 7687, 989];
        config.string = "local";
        config.int = 99;
        config.float = 8978123.123123;
        config.arreglito = arreglito.join(" ");
        fs.writeFileSync(documentsPath, ini.stringify(config));
      }
    });
  };

  render() {
    const { classes, fullScreen } = this.props;
    return (
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Grid item>
            <AppBar position="static" color="default">
              <Toolbar>
                <Typography type="title" color="inherit">
                  Analaysis of Null Areas (ANA)
                </Typography>
              </Toolbar>
            </AppBar>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <Button
                variant="raised"
                color={this.props.configurationForm.file_upload == undefined ? "default" : "secondary"}
                id="raised-button-file"
                component="span"
                onClick={() => this.showFileDialog("configuration.file_upload", "pdb")}
                className={classes.button}>
                {this.props.configurationForm.file_upload == undefined ? "Choose PDB File" : "Change PDB File"}
                <i className="material-icons">file_upload</i>
              </Button>
            </Grid>
            <Grid item>
              <FormLabel>{this.props.configurationForm.file_upload}</FormLabel>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="raised"
                color={this.props.configurationForm.ana_path == undefined ? "default" : "secondary"}
                id="raised-button-file"
                component="span"
                onClick={() => this.showFileDialog("configuration.ana_path", "all")}
                className={classes.button}>
                {this.props.configurationForm.ana_path == undefined ? "Select ANA executable" : "Change ANA executable"}
                <i className="material-icons">file_upload</i>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="raised"
                color={this.props.configurationForm.ana_path == undefined ? "default" : "secondary"}
                id="raised-button-file"
                component="span"
                onClick={() => this.executeANA()}
                className={classes.button}>
                Execute ANA
                <i className="material-icons">play_circle_outline</i>
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Tabs
            value={this.state.currentTab}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered>
            <Tab label="Static Options">
              <Paper className={classes.control}>
                <Grid container />
              </Paper>
            </Tab>
            <Tab label="MD and Output" />
          </Tabs>
          <SwipeableViews axis="x" index={this.state.currentTab} onChangeIndex={this.handleChangeIndex}>
            <TabContainer>
              <Grid container alignItems="baseline">
                <Grid item xs={12}>
                  <Typography align="center" variant="headline">
                    Include Area Options
                  </Typography>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    style={{ minWidth: "90%" }}
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
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    style={{ minWidth: "90%" }}
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
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    className={classes.formControl}
                    label="Area Precision"
                    handleChange={this.handleChange}
                    data={included_area_precisionOptions}
                    helperText="Method"
                    autoWidth={true}
                    model="configuration.included_area_precision"
                  />
                </Grid>
              </Grid>
              <Grid container alignItems="baseline">
                <Grid item xs={12}>
                  <Typography align="center" variant="headline">
                    Area Cluster and ASA options
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    helperText=""
                    autoWidth={true}
                    minWidth="120px"
                    label="clusters_methodOptions"
                    handleChange={this.handleChange}
                    data={clusters_methodOptions}
                    model="configuration.clusters_method"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
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
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
                      help_outline
                    </i>
                  </Tooltip>
                  <SelectComponent
                    helperText=""
                    label="ASA_discard_methodOptions"
                    handleChange={this.handleChange}
                    data={ASA_discard_methodOptions}
                    model="configuration.ASA_discard_method"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="inside: keep inside nulls || outside: keep outside nulls">
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
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
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
                      help_outline
                    </i>
                  </Tooltip>
                  <Control.text
                    component={TextField}
                    model="configuration.ASA_exclude_amino_acids"
                    id="ASA_exclude_amino_acids"
                    label="ASA_exclude_amino_acids"
                    helperText="Don't use these to discard ASA cells."
                    className={classes.textField}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title="Minimum dot product to keep(discard) cell. As it increases more cells are classified as being outside.">
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
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
                    <i style={{ fontSize: "12px", color: "grey", marginRight: "5px" }} className="material-icons">
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
            </TabContainer>
            <TabContainer>
              <Form model="configuration" onSubmit={this.handleSubmit}>
                <button type="submit">Submit</button>
              </Form>
            </TabContainer>
            <TabContainer>Item Three</TabContainer>
          </SwipeableViews>
        </Grid>
        <Dialog
          fullScreen={fullScreen}
          open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          aria-labelledby="responsive-dialog-title">
          <DialogTitle id="responsive-dialog-title">{"Execution Results"}</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.props.configurationForm.ana_execute_results}</DialogContentText>
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
const SelectComponent = ({ handleChange, model, data, label, helperText, className, ...props }) => {
  return (
    <FormControl className={className}>
      <InputLabel htmlFor={model}>{label}</InputLabel>
      <Control.select
        model={model}
        id={model}
        autoWidth={true}
        component={Select}
        mapProps={{
          value: props => {
            if (props.modelValue == undefined) {
              return "none";
            }
            return props.modelValue;
          },
        }}
        onChange={handleChange}>
        {data.map((child, index) => {
          return (
            <MenuItem key={index} value={child.value}>
              {child.text}
            </MenuItem>
          );
        })}
      </Control.select>
      <FormHelperText>{helperText} </FormHelperText>
    </FormControl>
  );
};
//
const output_typeOptions = [
  {
    text: "raw_pdb",
    value: "raw_pdb",
  },
  {
    text: "raw_cgo",
    value: "raw_cgo",
  },
  {
    text: "grid_pdb",
    value: "grid_pdb",
  },
  {
    text: "grid_cgo",
    value: "grid_cgo",
  },
];
const clusters_methodOptions = [
  {
    text: "None",
    value: "none",
  },
  {
    text: "Facets",
    value: "facets",
  },
  {
    text: "Boxes",
    value: "boxes",
  },
];
const included_area_precisionOptions = [
  {
    text: "None",
    value: "none",
  },
  {
    value: "0",
    text: "0",
  },
  {
    value: "1",
    text: "1",
  },
];
const ASA_discard_methodOptions = [
  {
    text: "None",
    value: "none",
  },
  {
    value: "cm",
    text: "CM",
  },
  {
    value: "backbone",
    text: "Backbone",
  },
  {
    value: "axes",
    text: "Axes",
  },
];
const ASA_only_sideOptions = [
  {
    text: "Outside",
    value: "outside",
  },
  {
    value: "inside",
    text: "Inside",
  },
  {
    value: "backbone",
    text: "Backbone",
  },
  {
    value: "axes",
    text: "Axes",
  },
];
export default kea(keaOptions)(withStyles(styles)(Home));
