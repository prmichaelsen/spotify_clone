#!/usr/bin/env python
from flask import Flask, abort, request
from uuid import uuid4
import requests
import requests.auth
import urllib
import praw
import sys
import os
CLIENT_ID = os.environ['REGRETIT_CLIENT_ID']
CLIENT_SECRET =   os.environ['REGRETIT_CLIENT_SECRET']
REDIRECT_URI = "http://www.patrickmichaelsen.com/regretit/reddit_callback"

def user_agent():
    '''reddit API clients should each have their own, unique user-agent
    Ideally, with contact info included.
    
    e.g.,
    return "oauth2-sample-app by /u/%s" % your_reddit_username
    '''
    return "oauth2-simple-app by /u/%s" % 'prmichaelsen'

    raise NotImplementedError()

def base_headers():
    return {"User-Agent": user_agent()}

def make_authorization_url():
    state = str(uuid4())
    save_created_state(state)
    params = {"client_id": CLIENT_ID,
              "response_type": "code",
              "state": state,
              "redirect_uri": REDIRECT_URI,
              "duration": "permanent",
              "scope": "identity edit read history"}
    url = "https://ssl.reddit.com/api/v1/authorize?" + urllib.urlencode(params)
    return url 

def get_token(code):
    client_auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    post_data = {"grant_type": "authorization_code",
                 "code": code,
                 "redirect_uri": REDIRECT_URI}
    headers = base_headers()
    response = requests.post("https://ssl.reddit.com/api/v1/access_token",
                             auth=client_auth,
                             headers=headers,
                             data=post_data)
    token_json = response.json()
    return token_json;

def get_refresh_token(refresh_token):
    client_auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    post_data = {"grant_type": "refresh_token",
                 "refresh_token": refresh_token}
    headers = base_headers()
    response = requests.post("https://ssl.reddit.com/api/v1/access_token",
                             auth=client_auth,
                             headers=headers,
                             data=post_data)
    token_json = response.json()
    return token_json["access_token"]  
    
def get_username(access_token):
    headers = base_headers()
    headers.update({"Authorization": "bearer " + access_token})
    response = requests.get("https://oauth.reddit.com/api/v1/me", headers=headers)
    me_json = response.json()
    return me_json['name']

print( get_token(sys.argv)["refresh_token"]);
sys.stdout.flush();
