import { useEffect } from 'react';

import { create } from 'zustand';

const useStore = create((set) => ({
  page: 1,
  list: [],
  beers: [],
  n: 0,
  size: 0,
  deleteList: [],

  Fetch: async (page, n, size, deleteListSize) => {
    if (size - deleteListSize < n + 15) {
      const response = await fetch(`https://api.punkapi.com/v2/beers?page=${page}`);
      set({ beers: await response.json().then(item => item.map(item => ({ ...item, show: false, background: false }))), page: page + 1 });
      set((state) => ({
        beers: deleteListSize ? [...state.list.filter(item => !state.deleteList.includes(item.id)), ...state.beers.slice()] : [...state.list, ...state.beers],
        n: 0
      }));
      n = 0;
    }
    else if (deleteListSize) {
      set((state) => ({
        beers: state.beers.filter(item => !state.deleteList.includes(item.id))
      }));
    }

    set((state) => ({
      list: state.beers.slice(n, n + 15),
      n: n + 5,
      size: state.beers.length
    }));

    if (deleteListSize) { set({ deleteList: [] }); }
  },

  ShowBeer: (id, show, list) => {
    list.find(item => item.id === id).show = show;
    set({ list: list });
  },

  BackgroundBeer: (id, background, list) => {
    list.find(item => item.id === id).background = background;
    set((state) => ({
      list: list,
      deleteList: background ? [...state.deleteList, id] : state.deleteList.filter(item => item !== id)
    }));
  }
}));

const Beers = () => {
  const { page, list, n, size, deleteList, Fetch, ShowBeer, BackgroundBeer } = useStore();

  useEffect(() => {
    Fetch(page, n, size);
  }, []);

  const OnFetch = (back, checkDeleteList) => {
    Fetch(page, n - back, size, checkDeleteList ? deleteList.length : 0);
  }

  const OnMouseDown = (e, id, show, background, list) => {
    if (e.button === 0) ShowBeer(id, show, list)
    else BackgroundBeer(id, background, list);
  }

  return (
    <>
      <button
        onClick={() => OnFetch(5, true)}
        className={`${deleteList.length > 0 ? 'button' : 'show'}`}
      >Delete</button>
      <h1>Beers</h1>
      <ul className='list'>
        {list.map(item => {
          const id = Math.random().toString();
          return (
            <li
              key={id}
              onMouseDown={(e) => OnMouseDown(e, item.id, item.show ? false : true, item.background ? false : true, list)}
              className={`${item.background === true ? 'background' : ''}`}
            >
              <h2 className='name'>{item.name}</h2>
              <p className={`${item.show === true ? '' : 'show'}`}>{item.description}</p>
              <hr />
            </li>
          );
        })}
      </ul>
      <p onClick={() => OnFetch(0, false)} className='arm'>Click to continue</p>
    </>
  )
}

export default function App() { return <Beers />; }
