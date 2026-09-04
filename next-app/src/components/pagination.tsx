import Link from "next/link";

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	recordCount: number;
	startIndex: number;
	endIndex: number;
	hrefBuilder: (page: number) => string;
};

export function Pagination({
	currentPage,
	totalPages,
	startIndex,
	endIndex,
	recordCount,
	hrefBuilder,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<div className="table-pagination">
			<small className="subtle">
				{startIndex + 1}–{Math.min(endIndex, recordCount)} of {recordCount}
			</small>
			<div className="table-pagination-actions">
				<Link
					href={hrefBuilder(currentPage - 1)}
					className="table-page-btn"
					aria-disabled={currentPage === 1}
					tabIndex={currentPage === 1 ? -1 : undefined}
				>
					Previous
				</Link>
				<small className="subtle">
					Page {currentPage} / {totalPages}
				</small>
				<Link
					href={hrefBuilder(currentPage + 1)}
					className="table-page-btn"
					aria-disabled={currentPage === totalPages}
					tabIndex={currentPage === totalPages ? -1 : undefined}
				>
					Next
				</Link>
			</div>
		</div>
	);
}
