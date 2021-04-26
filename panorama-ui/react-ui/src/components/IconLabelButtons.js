import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import axios from 'axios';
import jsFileDownload from "js-file-download";

import * as reactRouterDom from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

export default function IconLabelButtons({ selectedRows, setSelectedRows }) {
  const [username, setUsernameState] = useState("");
  const [images, setImageState] = useState([]);
  const history = reactRouterDom.useHistory();
  const fileSelectedHandler = async (event) => {

    const file = event.target.files;
    // const cookies = new Cookies();
    // const name = cookies.get('username');
    const name = localStorage.getItem("username");
    const imageFiles = [];

    for (const eachFile of file) {
      imageFiles.push({
        imageData: await convertBase64(eachFile),
        imageName: eachFile.name
      });
    }


    setUsernameState(name);
    setImageState(imageFiles);
  };


  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file)
      fileReader.onload = () => {
        resolve(fileReader.result);
      }
      fileReader.onerror = (error) => {
        reject(error);
      }
    })
  }

  const fileUploadHandler = () => {
    // const baseURL = process.env.gatewayServerIP + ":" + process.env.gatewayServicePort || 'http://localhost:3000'
    // const baseURL = "http://149.165.171.5:30200"
    const baseURL = "/api"
    const jwtToken = localStorage.getItem(ACCESS_TOKEN_NAME);
    axios.post(baseURL + "/image", { username: username, images: images }, { headers: { 'Authorization': "Bearer " + jwtToken }, params: { username: username } })
      .then(res => {
        // console.log(res)
        // refresh the page after image has been uploaded.
        history.go(0)

      })
  }

  const fileDownloadHandler = () => {
    // hardcode to take first image Id
    if (selectedRows.length == 0) {
      return;
    }
    const imgId = selectedRows[0];
    const user = localStorage.getItem("username");
    // const baseURL = "http://149.165.171.5:30200"
    const baseURL = "/api"
    const jwtToken = localStorage.getItem(ACCESS_TOKEN_NAME);
    axios.get(baseURL + "/image", { headers: { 'Authorization': "Bearer " + jwtToken }, params: { username: user, imageId: imgId } })
      .then(res => {
        const imageData = res.data.imageData;
        const imageName = res.data.imageName;
        jsFileDownload(imageData, imageName);
        setSelectedRows([]);
      });

  }
  const classes = useStyles();
  return (
    <div className="buttons">
      <Button
        variant="contained"
        color="secondary"
        className={classes.button}
      >
        Share
      </Button>
      {/* This Button uses a Font Icon, see the installation instructions in the Icon component docs. */}
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
      >
        Delete
      </Button>
      <Button
        variant="contained"
        color="secondary"
        className={classes.button}
        onClick={fileDownloadHandler}
      >
        Download
      </Button>
      <Button
        onClick={fileUploadHandler}
        variant="contained"
        color="default"
        className={classes.button}
      >
        Upload
      </Button>
      <input type="file" multiple onChange={fileSelectedHandler} />
      <Button
        variant="contained"
        color="primary"
        size="small"
        className={classes.button}
      >
        Accounts
      </Button>
    </div>
  );
}