import fetch from 'node-fetch';
import {Stats} from "./model/Stats";
const schedule = require('node-schedule');

const job = schedule.scheduleJob('0 0 * * * *', () => {

});

process.on('SIGINT', () => {
    schedule.gracefulShutdown()
        .then(() => process.exit(0))
});


const followersPattern = /"edge_followed_by":{"count":(\d*)}/g;
const followingPattern = /"edge_follow":{"count":(\d*)}/g;
const postsPattern = /"edge_owner_to_timeline_media":{"count":(\d*),/g;

async function getStats(handle: string): Promise<Stats> {
    return fetch(`https://www.instagram.com/${handle}`)
        .then(response => response.text())
        .then(text => {
            return {
                handle,
                followers: parseInt(followersPattern.exec(text)[1]),
                following: parseInt(followingPattern.exec(text)[1]),
                posts: parseInt(postsPattern.exec(text)[1])
            };
        });
}

// getFollowers('fantastiskefroe.dk')
//     .then(val => console.log(val));
//
//
// getFollowers('spirekassen')
//     .then(val => console.log(val));