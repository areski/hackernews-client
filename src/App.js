import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';
const DEFAULT_HPP = 5;


// function isSearched(searchTerm) {
//   return function (item) {
//     // some condition which return true or false
//     return item.title.toLowerCase().includes(searchTerm.toLowerCase());
//   }
// }


// // functional stateless components - destruction props immediately
// // function Search({ value, onChange, children}) {
//
// functional stateless components
// function Search(props) {
//   const { value, onChange, children } = props;
//   return (
//     <form>
//       {children}
//       <input type="text" value={value} onChange={onChange} />
//     </form>
//   );
// }

// React Component
// class Search extends Component {
//   render() {
//     const { value, onChange } = this.props;
//     return (
//       <form>
//         <input type="text" value={value} onChange={onChange} />
//       </form>
//     );
//   }
// }

const Search = ({ value, onChange, onSubmit, children }) =>
  <form onSubmit={onSubmit}>
    <input
      type="text"
      value={value}
      onChange={onChange} />
    <button type="submit">
      {children}
    </button>
  </form>


const Button = ({ onClick, className = 'button-active', children }) =>
  <button
    className={className}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>


const largeColumn = { width: '40%' }
const midColumn = { width: '30%' }
const smallColumn = { width: '10%' }

const Table = ({ list, onDismiss }) =>
  <div className="table">
    {
      list != null && list
        .map(item =>
          <div key={item.objectID} className="table-row">
            <span style={largeColumn}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={midColumn}>{item.author}</span>
            <span style={midColumn}>{item.created_at}</span>
            <span style={smallColumn}>{item.num_comments}</span>
            <span style={smallColumn}>{item.points}</span>
            <span style={smallColumn}>
              <Button onClick={() => onDismiss(item.objectID)} className="button-inline">
                Dismiss!
                </Button>
            </span>
          </div>
        )
    }
  </div>


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
    };
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories = (searchTerm, page = 0) => {
    console.log(`fetchSearchTopStories... ${searchTerm}`)
    // fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    //   .then(response => response.json())
    //   .then(result => this.setSearchTopStories(result))
    //   .catch(error => this.setState({ error }));
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this.setState({ error }));
  }

  onDismiss = (id) => {
    console.log(`onDismiss => id:${id}`);
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    // this.setState({
    //   result: { ...this.state.result, hits: updatedHits }
    // });
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  onSearchChange(event) {
    console.log("in onSearchChange...");
    console.log(event.target.value);
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    console.log("in onSearchSubmit...");
    console.log(event.target.value);
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    console.log(`setSearchTopStories... ${searchKey}`)

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    console.log(updatedHits);
    this.setState({
      results: {
        ...results,
        [searchKey]: {
          hits: updatedHits, page
        }
      }
    });
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    const { searchTerm, searchKey, results, error } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    if (error) {
      return (<p>Something went wrong...</p>);
    }

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search</Search>
        </div>
        {results && results[searchKey] ?
          <Table
            list={list}
            onDismiss={this.onDismiss}
          />
          : null
        }
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            More
          </Button>
        </div>

      </div>
    );
  }
}

export default App;