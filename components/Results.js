import {fetchData} from 'functions/fetchData'
import PropTypes from 'prop-types'
import {useEffect, useState} from 'react'
import {useInView} from 'react-intersection-observer'
import Card from './Card'
import Masonry from 'react-masonry-css'
import Skeleton from './Skeleton'
const breakpointColumnsObj = {
  default: 3,
  766: 1
}

export default function Results({subreddit, sortBy}) {
  const [ref, inView] = useInView({
    rootMargin: '200px 0px'
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(null)
  const [posts, setPosts] = useState([])
  const [lastPost, setLastPost] = useState(null)
  const [clicked, setClicked] = useState(false)

  /**
   * Helper to force clear all state.
   */
  function clearState() {
    setPosts([])
    setLastPost(null)
    setClicked(false)
  }

  /**
   * Get the initial set of posts.
   */
  async function loadInitialPosts() {
    setLoading(true)
    const data = await fetchData({subreddit, sortBy})
    clearState()
    setPosts(data?.posts)
    setLastPost(data?.after)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  /**
   * Get more posts.
   */
  async function loadMorePosts() {
    setLoadingMore(true)
    const data = await fetchData({subreddit, lastPost, sortBy})
    setPosts((prevResults) => [...prevResults, ...data.posts])
    setLastPost(data?.after)
    setLoadingMore(false)
    setClicked(true)
  }

  useEffect(() => {
    loadInitialPosts()
  }, [subreddit, sortBy]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (clicked) {
      loadMorePosts()
    }
  }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <Skeleton />
  }

  return (
    <>
      <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-4">
        {posts.map((post, index) => (
          <Card key={index} {...post} />
        ))}
      </Masonry>
      <button
        ref={ref}
        className="animate mt-16 ml-auto mr-auto flex py-2 px-4 text-white"
        onClick={loadMorePosts}
      >
        {loadingMore ? <>Loading...</> : <>Load More Posts</>}
      </button>
    </>
  )
}

Results.propTypes = {
  sortBy: PropTypes.string,
  subreddit: PropTypes.string.isRequired
}
