const Filter = ({ filter, filterChangeHandler }) => {
  return (
    <form>
      <div>
        filter shown with <input value={filter} onChange={filterChangeHandler} />
      </div>
    </form>
  )
}

export default Filter