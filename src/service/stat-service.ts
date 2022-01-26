import {Stats} from "../model/stats";

const followersPattern = /"edge_followed_by":{"count":(\d*)}/g;
const followingPattern = /"edge_follow":{"count":(\d*)}/g;
const postsPattern = /"edge_owner_to_timeline_media":{"count":(\d*),/g;

const options = {
    headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
    },
    redirect: 'error'
};

export async function getStats(handle: string): Promise<Stats> {
    return {
        handle,
        followers: Math.round(Math.random() * 10000),
        following: Math.round(Math.random() * 1000),
        posts: Math.round(Math.random() * 100)
    };
    /*
    return fetch(`https://www.instagram.com/${handle}`, options)
        .then(response => {
            console.log(response);
            return response.text();
        })
        .then(text => {
            console.log(followersPattern.exec(text));
            console.log(followingPattern.exec(text));
            console.log(postsPattern.exec(text));
            return {
                handle,
                followers: parseInt(followersPattern.exec(text)[1]),
                following: parseInt(followingPattern.exec(text)[1]),
                posts: parseInt(postsPattern.exec(text)[1])
            };
        });
     */
}