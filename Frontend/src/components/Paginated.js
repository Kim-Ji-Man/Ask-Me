import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from "react-table";
import "../css/board.css";


function Paginated({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setGlobalFilter,
    page,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    state: { pageIndex},
    gotoPage,
    pageCount,
  } = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 5 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // 검색어를 받아 글로벌 필터로 설정하는 함수
  const handleSearch = (query) => {
    console.log("검색어:", query); // 검색어 출력으로 확인
    setGlobalFilter(query); // 글로벌 필터 설정
  };

  // 페이지 번호를 계산하여 반환하는 함수
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(pageIndex - 4, 0);
    let endPage = Math.min(startPage + 9, pageCount - 1);

    // 시작 페이지를 조정하여 항상 10개의 페이지 번호를 유지 (가능한 경우)
    if (endPage - startPage < 9) {
      startPage = Math.max(endPage - 9, 0);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      <div className="all">
        <table {...getTableProps()} className="custom-table">
          <thead className="header1">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={{ width: column.width }}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Paginated;
