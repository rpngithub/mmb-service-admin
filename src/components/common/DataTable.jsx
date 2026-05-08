import { Table, Pagination, Stack, Message } from 'rsuite'

const { Column, HeaderCell, Cell } = Table

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  onSortColumn,
  sortColumn,
  sortType,
  rowKey = 'id',
  height = 420,
  error,
}) => {
  if (error) {
    return <Message type="error" showIcon>{error}</Message>
  }

  return (
    <Stack direction="column" spacing={12} alignItems="stretch">
      <Table
        data={data}
        loading={loading}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={onSortColumn}
        height={height}
        rowKey={rowKey}
        bordered
        cellBordered
        style={{ borderRadius: 8, overflow: 'hidden' }}
      >
        {columns.map(({ key, label, width, flexGrow, fixed, sortable, renderCell }) => (
          <Column key={key} width={width} flexGrow={flexGrow} fixed={fixed} sortable={sortable}>
            <HeaderCell style={{ fontWeight: 600, background: '#f9fafb' }}>{label}</HeaderCell>
            <Cell dataKey={key}>
              {renderCell ? (rowData) => renderCell(rowData) : undefined}
            </Cell>
          </Column>
        ))}
      </Table>
      {total !== undefined && onPageChange && (
        <Stack justifyContent="flex-end">
          <Pagination
            total={total}
            activePage={page}
            onChangePage={onPageChange}
            limit={pageSize}
            layout={['total', '-', 'pager']}
          />
        </Stack>
      )}
    </Stack>
  )
}

export { Column, HeaderCell, Cell }
export default DataTable
