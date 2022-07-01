import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter as Router, Route } from "react-router-dom";
import {Sidenav, NavBar} from "./component/navbars.jsx";
import Searchbar from "./component/searchbar.jsx";
import ArConnect from './component/arconnect.jsx';
import EpisodeQueue from '././component/episode_queue.jsx';
import { Player, PlayerMobile} from './component/player.jsx';
import { FeaturedView } from './component/featured.jsx';
import { convertToEpisode, convertToPodcast, sortPodcasts } from './utils/podcast.js';


export default function App() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState(0);

  const playerRef = useRef();
  const videoRef = useRef();
  const playButtonRef = useRef();

  const [currentEpisode, setCurrentEpisode] = useState(null);
  const playEpisode = (episode) => {
    // if (episode.contentUrl === currentEpisode.contentUrl) {
    //   // do something here to trigger a re-render maybe or force a re-render for featured episode
    //   setCurrentEpisode(queue)
    // }
    setCurrentEpisode(episode);
  };

  window.addEventListener('keydown', function(e) {
    if(e.key == " " && e.target == document.body) {
      e.preventDefault();
    }
  });

  const [address, setAddress] = useState();
  const [ANSData, setANSData] = useState({address_color: "", currentLabel: "", avatar: ""});
  const [walletConnected, setWalletConnected] = useState(false)

  // const [podcasts, setPodcasts] = useState();
  // const [sortedPodcasts, setSortedPodcasts] = useState();
  const [queue, setQueue] = useState([]);
  const [queueVisible, setQueueVisible] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [featuredPodcasts, setFeaturedPodcasts] = useState();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);


  const appState = {
    t: t,
    themeColor: 'rgb(255, 255, 0)',
    loading: loading,
    theme: {},
    view: {
      views: ["featured", ""],
      currentTabIndex: currentTabIndex,
      setCurrentTabIndex: setCurrentTabIndex,
    },
    views: {
      featured: {
        recentlyAdded: recentlyAdded,
        featuredPodcasts: featuredPodcasts,
        creators: [
          {
            fullname: 'Marton Lederer',
            anshandle: 'martonlederer',
            avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
          }, {
            fullname: 'Marton Lederer',
            anshandle: 'martonlederer',
            avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
          }, {
            fullname: 'Marton Lederer',
            anshandle: 'martonlederer',
            avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
          }
        ],
      },
    },
    user: {
      address: address,
      setAddress: setAddress,
      ANSData: ANSData,
      setANSData: setANSData,
      walletConnected: walletConnected,
      setWalletConnected: setWalletConnected,
    },
    queue: {
      get: () => queue,
      set: setQueue,
      enqueueEpisode: (episode) => setQueue([episode]),
      enqueuePodcast: (episodes) => setQueue(episodes),
      play: (episode) => playEpisode(episode),
      playEpisode: (episode) => {setQueue([episode]); playEpisode(episode)},
      visibility: queueVisible,
      toggleVisibility: () => setQueueVisible(!queueVisible),
    },
    queueHistory: {
      // This can be used for playback history tracking
    },
    playback: {
      player: playerRef.current,
      playerRef: playerRef,
      videoRef: videoRef,
      playButtonRef: playButtonRef,
      currentEpisode: currentEpisode,
    },
  }
  
  const filters = [
    {type: "episodescount", desc: t("sorting.episodescount")},
    {type: "podcastsactivity", desc: t("sorting.podcastsactivity")}
  ];
  const filterTypes = filters.map(f => f.type)

  // const changeSorting = (n) => {
  //   setPodcasts(podcasts[filterTypes[n]])
  //   setSelection(n)
  // }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const sorted = await sortPodcasts(filterTypes)
      const podcasts = sorted[filterTypes[selection]].splice(0, 4)
      const convertedPodcasts = podcasts.map(p => convertToPodcast(p))
      const convertedEpisodes = podcasts.map(p => convertToEpisode(p, p.episodes[0]))
      setCurrentEpisode(convertedEpisodes[0])
      setRecentlyAdded(convertedEpisodes)
      setFeaturedPodcasts(convertedPodcasts)
      // setSortedPodcasts(sorted)
      // setPodcasts(sorted[filterTypes[selection]])
      setLoading(false)
    }
    fetchData()
  }, [])

  // TODO 
  // place url queries inside app component
  // add a loading skeleton for the app
  // use context api to remove prop drilling
  // clean up useEffect and appState code
  // add translations

  return (
    <div className="select-none h-full bg-black overflow-hidden " data-theme="business">
      <div className="flex h-screen">
        <div className="md:hidden absolute z-10 bottom-0 w-screen">
          {!loading ? <PlayerMobile episode={currentEpisode} appState={appState} /> : <div>Loading...</div>}
        </div>
        <div className="hidden md:block">
          <div className="mr-8">
            <Sidenav />
          </div>
          <div className="absolute z-20 bottom-0">
            {!loading && currentEpisode ? <Player episode={currentEpisode} appState={appState} />: <div>Loading...</div>}
          </div>
          <div className="absolute z-10 bottom-0 right-0" style={{display: queueVisible ? 'block': 'none'}}>
            {!loading ? <EpisodeQueue appState={appState} />: <div>Loading...</div>}
          </div>
        </div>
        <div className="overflow-scroll ml-8 pr-8 pt-9 w-screen">
          <div className="app-view">
            {!loading ? (
              <>
                <NavBar appState={appState} />
                <div className="pb-20 w-full overflow-hidden">
                  <FeaturedView appState={appState} />
                </div>
              </>
            ) : <div>Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// <Route exact path="/" render={() => <Index />} />
