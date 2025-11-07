import { X } from 'lucide-react';

interface TTestCriticalValuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDF?: number;
}

const tTestData = [
  { df: 1, value: 6.3138 }, { df: 2, value: 2.92 }, { df: 3, value: 2.3534 }, { df: 4, value: 2.1319 }, { df: 5, value: 2.015 },
  { df: 6, value: 1.9432 }, { df: 7, value: 1.8946 }, { df: 8, value: 1.8595 }, { df: 9, value: 1.8331 }, { df: 10, value: 1.8124 },
  { df: 11, value: 1.7959 }, { df: 12, value: 1.7823 }, { df: 13, value: 1.7709 }, { df: 14, value: 1.7613 }, { df: 15, value: 1.753 },
  { df: 16, value: 1.7459 }, { df: 17, value: 1.7396 }, { df: 18, value: 1.7341 }, { df: 19, value: 1.7291 }, { df: 20, value: 1.7247 },
  { df: 21, value: 1.7207 }, { df: 22, value: 1.7172 }, { df: 23, value: 1.7139 }, { df: 24, value: 1.7109 }, { df: 25, value: 1.7081 },
  { df: 26, value: 1.7056 }, { df: 27, value: 1.7033 }, { df: 28, value: 1.7011 }, { df: 29, value: 1.6991 }, { df: 30, value: 1.6973 },
  { df: 31, value: 1.6955 }, { df: 32, value: 1.6939 }, { df: 33, value: 1.6924 }, { df: 34, value: 1.6909 }, { df: 35, value: 1.6896 },
  { df: 36, value: 1.6883 }, { df: 37, value: 1.6871 }, { df: 38, value: 1.6859 }, { df: 39, value: 1.6849 }, { df: 40, value: 1.6839 },
  { df: 41, value: 1.6829 }, { df: 42, value: 1.682 }, { df: 43, value: 1.6811 }, { df: 44, value: 1.6802 }, { df: 45, value: 1.6794 },
  { df: 46, value: 1.6787 }, { df: 47, value: 1.6779 }, { df: 48, value: 1.6772 }, { df: 49, value: 1.6766 }, { df: 50, value: 1.6759 },
  { df: 51, value: 1.6753 }, { df: 52, value: 1.6747 }, { df: 53, value: 1.6741 }, { df: 54, value: 1.6736 }, { df: 55, value: 1.673 },
  { df: 56, value: 1.6725 }, { df: 57, value: 1.672 }, { df: 58, value: 1.6715 }, { df: 59, value: 1.6711 }, { df: 60, value: 1.6706 },
  { df: 61, value: 1.6702 }, { df: 62, value: 1.6698 }, { df: 63, value: 1.6694 }, { df: 64, value: 1.669 }, { df: 65, value: 1.6686 },
  { df: 66, value: 1.6683 }, { df: 67, value: 1.6679 }, { df: 68, value: 1.6676 }, { df: 69, value: 1.6673 }, { df: 70, value: 1.6669 },
  { df: 71, value: 1.6666 }, { df: 72, value: 1.6663 }, { df: 73, value: 1.666 }, { df: 74, value: 1.6657 }, { df: 75, value: 1.6654 },
  { df: 76, value: 1.6652 }, { df: 77, value: 1.6649 }, { df: 78, value: 1.6646 }, { df: 79, value: 1.6644 }, { df: 80, value: 1.6641 },
  { df: 81, value: 1.6639 }, { df: 82, value: 1.6636 }, { df: 83, value: 1.6634 }, { df: 84, value: 1.6632 }, { df: 85, value: 1.663 },
  { df: 86, value: 1.6628 }, { df: 87, value: 1.6626 }, { df: 88, value: 1.6623 }, { df: 89, value: 1.6622 }, { df: 90, value: 1.662 },
  { df: 91, value: 1.6618 }, { df: 92, value: 1.6616 }, { df: 93, value: 1.6614 }, { df: 94, value: 1.6612 }, { df: 95, value: 1.661 },
  { df: 96, value: 1.6609 }, { df: 97, value: 1.6607 }, { df: 98, value: 1.6606 }, { df: 99, value: 1.6604 }, { df: 100, value: 1.6602 },
  { df: 101, value: 1.6601 }, { df: 102, value: 1.6599 }, { df: 103, value: 1.6598 }, { df: 104, value: 1.6596 }, { df: 105, value: 1.6595 },
  { df: 106, value: 1.6593 }, { df: 107, value: 1.6592 }, { df: 108, value: 1.6591 }, { df: 109, value: 1.6589 }, { df: 110, value: 1.6588 },
  { df: 111, value: 1.6587 }, { df: 112, value: 1.6586 }, { df: 113, value: 1.6585 }, { df: 114, value: 1.6583 }, { df: 115, value: 1.6582 },
  { df: 116, value: 1.6581 }, { df: 117, value: 1.658 }, { df: 118, value: 1.6579 }, { df: 119, value: 1.6578 }, { df: 120, value: 1.6577 },
  { df: 121, value: 1.6575 }, { df: 122, value: 1.6574 }, { df: 123, value: 1.6573 }, { df: 124, value: 1.6572 }, { df: 125, value: 1.6571 },
  { df: 126, value: 1.657 }, { df: 127, value: 1.657 }, { df: 128, value: 1.6568 }, { df: 129, value: 1.6568 }, { df: 130, value: 1.6567 },
  { df: 131, value: 1.6566 }, { df: 132, value: 1.6565 }, { df: 133, value: 1.6564 }, { df: 134, value: 1.6563 }, { df: 135, value: 1.6562 },
  { df: 136, value: 1.6561 }, { df: 137, value: 1.6561 }, { df: 138, value: 1.656 }, { df: 139, value: 1.6559 }, { df: 140, value: 1.6558 },
  { df: 141, value: 1.6557 }, { df: 142, value: 1.6557 }, { df: 143, value: 1.6556 }, { df: 144, value: 1.6555 }, { df: 145, value: 1.6554 },
  { df: 146, value: 1.6554 }, { df: 147, value: 1.6553 }, { df: 148, value: 1.6552 }, { df: 149, value: 1.6551 }, { df: 150, value: 1.6551 },
  { df: 151, value: 1.655 }, { df: 152, value: 1.6549 }, { df: 153, value: 1.6549 }, { df: 154, value: 1.6548 }, { df: 155, value: 1.6547 },
  { df: 156, value: 1.6547 }, { df: 157, value: 1.6546 }, { df: 158, value: 1.6546 }, { df: 159, value: 1.6545 }, { df: 160, value: 1.6544 },
  { df: 161, value: 1.6544 }, { df: 162, value: 1.6543 }, { df: 163, value: 1.6543 }, { df: 164, value: 1.6542 }, { df: 165, value: 1.6542 },
  { df: 166, value: 1.6541 }, { df: 167, value: 1.654 }, { df: 168, value: 1.654 }, { df: 169, value: 1.6539 }, { df: 170, value: 1.6539 },
  { df: 171, value: 1.6538 }, { df: 172, value: 1.6537 }, { df: 173, value: 1.6537 }, { df: 174, value: 1.6537 }, { df: 175, value: 1.6536 },
  { df: 176, value: 1.6536 }, { df: 177, value: 1.6535 }, { df: 178, value: 1.6535 }, { df: 179, value: 1.6534 }, { df: 180, value: 1.6534 },
  { df: 181, value: 1.6533 }, { df: 182, value: 1.6533 }, { df: 183, value: 1.6532 }, { df: 184, value: 1.6532 }, { df: 185, value: 1.6531 },
  { df: 186, value: 1.6531 }, { df: 187, value: 1.6531 }, { df: 188, value: 1.653 }, { df: 189, value: 1.6529 }, { df: 190, value: 1.6529 },
  { df: 191, value: 1.6529 }, { df: 192, value: 1.6528 }, { df: 193, value: 1.6528 }, { df: 194, value: 1.6528 }, { df: 195, value: 1.6527 },
  { df: 196, value: 1.6527 }, { df: 197, value: 1.6526 }, { df: 198, value: 1.6526 }, { df: 199, value: 1.6525 }, { df: 200, value: 1.6525 },
];

export default function TTestCriticalValuesModal({ isOpen, onClose, currentDF }: TTestCriticalValuesModalProps) {
  if (!isOpen) return null;

  const columns = 4;
  const rowsPerColumn = Math.ceil(tTestData.length / columns);
  const tableColumns = Array.from({ length: columns }, (_, colIndex) =>
    tTestData.slice(colIndex * rowsPerColumn, (colIndex + 1) * rowsPerColumn)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">T-Test Critical Values Table</h2>
            <p className="text-sm text-gray-600 mt-1">
              Two-tailed test at 95% confidence level (α = 0.05)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {currentDF && (
            <div className="mb-4 p-4 bg-[#003865] text-white rounded-lg">
              <p className="text-sm font-medium">
                Your Degrees of Freedom (DF): <span className="text-lg font-bold">{currentDF}</span>
              </p>
              <p className="text-sm mt-1">
                Critical Value: <span className="text-lg font-bold">
                  {tTestData.find(d => d.df === currentDF)?.value.toFixed(4) || 'N/A'}
                </span>
              </p>
              <p className="text-xs mt-2 opacity-90">
                The test passes if the absolute value of your T-statistic is less than or equal to this critical value.
              </p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-6">
            {tableColumns.map((columnData, colIndex) => (
              <div key={colIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-0">
                    <div className="px-3 py-2 text-xs font-bold text-gray-700 border-r border-gray-200 text-center">
                      DF
                    </div>
                    <div className="px-3 py-2 text-xs font-bold text-gray-700 text-center">
                      Critical Value
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {columnData.map((row) => (
                    <div
                      key={row.df}
                      className={`grid grid-cols-2 gap-0 ${
                        currentDF === row.df ? 'bg-[#003865] text-white font-bold' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`px-3 py-2 text-sm text-center ${
                        currentDF === row.df ? 'border-r border-white' : 'border-r border-gray-100'
                      }`}>
                        {row.df}
                      </div>
                      <div className="px-3 py-2 text-sm text-center">
                        {row.value.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 mb-2">How to Use This Table:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>1. Find your Degrees of Freedom (DF) in the left column</li>
              <li>2. Read the corresponding Critical Value in the right column</li>
              <li>3. Compare the absolute value of your T-statistic to the Critical Value</li>
              <li>4. If |T-statistic| ≤ Critical Value, the test passes</li>
              <li>5. If |T-statistic| &gt; Critical Value, the test fails</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
