// Copyright 2016 Eyevinn Technology. All rights reserved
// Use of this source code is governed by a MIT License
// license that can be found in the LICENSE file.
// Author: Jonas Birme (Eyevinn Technology)
var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const https = require('https')

function initiateDefaultConf() {
  return {
    "row0": [],
    "row1": []
  };
}

/* GET home page. */
router.get('/', function(req, res) {
  var broadcastsToday = [];
  // var date = moment().format('YYYY-MM-DD');
  var date = "2024-08-16"
    fetch(`https://api.livearenasports.com/broadcast/?page-index=0&page-size=96&sort-order=Ascending&start-from=2024-08-02T08:37:48.000Z&include-live=true&sort-column=start`, {
        headers: {
            'accept': '*/*',
            'accept-language': 'da-DK,da;q=0.9',
            'content-type': 'application/json',
            'sec-ch-ua': "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': "\"Windows\"",
            'sec-fetch-dest': "empty",
            'sec-fetch-mode': "cors",
            'sec-fetch-site': "cross-site",
            'site-id': 'COM_META',
            'Referer': 'https://www.metalligaen.tv/',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        body: null,
        method: 'GET'
        }).then(response => response.json())
        .then(async json => {
          for (let i = 0; i < json.length; i++) {
            var mltvId = json[i]['id']
            var homeTeam = json[i]['homeTeam'] ?? '';
            if (homeTeam) {
              var homeTeamShort = homeTeam['shortName']
            }
            var awayTeam = json[i]['awayTeam']  ?? '';
            if (awayTeam) {
              var awayTeamShort = awayTeam['shortName']
            }
            var gameStatId = json[i]['extId'] ?? "0"
            var gameDay = json[i]['start'].split("T")[0]
            // console.log(gameDay)
            // console.log(date)


            if (gameDay == date) {
              streamId = await check(mltvId);
              streamURL = `https://cdn.livearenasports.com/blobs${streamId}/${mltvId}/index.m3u8`
              title = `${homeTeamShort} - ${awayTeamShort}`
              type = "hls"
              broadcastsToday.push(
                {title: title,
                manifest: streamURL,
                type: type
              })
              console.log(streamURL)
              // console.log(mltvId, homeTeamShort, awayTeamShort, gameStatId, gameDay)
            }
            
          }

          var config = `{
            "row0": 
              ${JSON.stringify(broadcastsToday)}
           ,
           "row1": [
            
          ]
          }`
    
            res.render('index', { title: 'MLTV Multiview', conf: config });
            // res.render('index', { title: 'MLTV Multiview', conf: JSON.stringify(config) });
  
  
  
          })
        .catch(error => console.error('Error:' + error));




});

async function check(id) {
   foundAny = false;
  try {
      const streamURL = await new Promise((resolve, reject) => {
          for (let i = 0; i < 4; i++) {
            var url = `https://cdn.livearenasports.com/blobs${i}/${id}/index.m3u8`
            https.get(`${url}`, async function(res) {
              // console.log(res)
              console.log("statusCode: ", res.statusCode + " - ID: " + i);
              if (res.statusCode == 200 && foundAny == false) {
                resolve(i)
                foundAny = true
              }
              if (i > 4) {
                  if (error) reject(error);
              }
          });
        }
      
    });

      return streamURL;
    
  } catch (err) {
    throw err;
  }
}


module.exports = router;
