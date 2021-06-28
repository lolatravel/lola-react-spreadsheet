export interface Row {
  id: string;
  name: {value: string; disabled?: boolean};
  parentId?: string;
  '2021-01-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-02-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-03-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-04-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-05-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-06-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-07-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-08-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-09-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-10-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-11-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2021-12-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  '2022-01-01': {value: string; disabled?: boolean; error?: boolean; alert?: string; warning?: string};
  children?: Row[];
  isExpanded?: boolean;
}

export function createRows(): Row[] {
  return [
    {
      name: { value: 'Search and Book', disabled: false },
      id: '20613843566739542',
      isExpanded: false,
      '2021-01-01': {
        value: '--',
        disabled: true
      },
      '2021-02-01': {
        value: '--',
        disabled: true
      },
      '2021-03-01': {
        value: '--',
        disabled: true
      },
      '2021-04-01': {
        value: '--',
        disabled: true
      },
      '2021-05-01': {
        value: '--',
        disabled: true
      },
      '2021-06-01': {
        value: '--',
        disabled: true
      },
      '2021-07-01': {
        value: '$0',
        disabled: false
      },
      '2021-08-01': {
        value: '$0',
        disabled: false
      },
      '2021-09-01': {
        value: '$0',
        disabled: false
      },
      '2021-10-01': {
        value: '$0',
        disabled: false
      },
      '2021-11-01': {
        value: '$0',
        disabled: false
      },
      '2021-12-01': {
        value: '$0',
        disabled: false
      },
      '2022-01-01': {
        value: '--',
        disabled: true
      }
    },
    {
      name: { value: 'Sales' },
      id: '25338270430806944',
      '2021-01-01': {
        value: '$10,000',
        disabled: false,
        alert: 'The sum of the sub-budgets must equal the parent budget.'
      },
      '2021-02-01': {
        value: '$10,000',
        disabled: false
      },
      '2021-03-01': {
        value: '$10,000',
        disabled: false
      },
      '2021-04-01': {
        value: '$10,000',
        disabled: false
      },
      '2021-05-01': {
        value: '$10,000',
        disabled: false
      },
      '2021-06-01': {
        value: '$10,000',
        disabled: false
      },
      '2021-07-01': {
        value: '$10,000',
        disabled: false
      },
      '2021-08-01': {
        value: '--',
        disabled: true
      },
      '2021-09-01': {
        value: '--',
        disabled: true
      },
      '2021-10-01': {
        value: '--',
        disabled: true
      },
      '2021-11-01': {
        value: '--',
        disabled: true
      },
      '2021-12-01': {
        value: '--',
        disabled: true
      },
      '2022-01-01': {
        value: '--',
        disabled: true
      },
      children: [{
        name: { value: 'Budget remainder', disabled: true },
        id: '25338270430806944-other',
        parentId: '25338270430806944',
        '2021-01-01': {
          value: '-$20',
          disabled: true
        },
        '2021-02-01': {
          value: '$5,000',
          disabled: true,
          warning: 'Too much budget.'
        },
        '2021-03-01': {
          value: '$5,000',
          disabled: true
        },
        '2021-04-01': {
          value: '$5,000',
          disabled: true
        },
        '2021-05-01': {
          value: '$5,000',
          disabled: true
        },
        '2021-06-01': {
          value: '$5,000',
          disabled: true
        },
        '2021-07-01': {
          value: '$5,000',
          disabled: true
        },
        '2021-08-01': {
          value: '--',
          disabled: true
        },
        '2021-09-01': {
          value: '--',
          disabled: true
        },
        '2021-10-01': {
          value: '--',
          disabled: true
        },
        '2021-11-01': {
          value: '--',
          disabled: true
        },
        '2021-12-01': {
          value: '--',
          disabled: true
        },
        '2022-01-01': {
          value: '--',
          disabled: true
        }
      }, {
        name: { value: 'Travel' },
        id: '25338270430806943',
        parentId: '25338270430806944',
        '2021-01-01': {
          value: '$10,020',
          disabled: false,
          error: true
        },
        '2021-02-01': {
          value: '$5,000',
          disabled: false
        },
        '2021-03-01': {
          value: '$5,000',
          disabled: false
        },
        '2021-04-01': {
          value: '$5,000',
          disabled: false
        },
        '2021-05-01': {
          value: '$5,000',
          disabled: false
        },
        '2021-06-01': {
          value: '$5,000',
          disabled: false
        },
        '2021-07-01': {
          value: '$5,000',
          disabled: false
        },
        '2021-08-01': {
          value: '--',
          disabled: true
        },
        '2021-09-01': {
          value: '--',
          disabled: true
        },
        '2021-10-01': {
          value: '--',
          disabled: true
        },
        '2021-11-01': {
          value: '--',
          disabled: true
        },
        '2021-12-01': {
          value: '--',
          disabled: true
        },
        '2022-01-01': {
          value: '--',
          disabled: true
        }
      }]
    },
    {
      name: { value: 'Engineering' },
      id: '26714847592858783',
      '2021-01-01': {
        value: '$200',
        disabled: true
      },
      '2021-02-01': {
        value: '$200',
        disabled: true
      },
      '2021-03-01': {
        value: '$200',
        disabled: true
      },
      '2021-04-01': {
        value: '$200',
        disabled: true
      },
      '2021-05-01': {
        value: '$200',
        disabled: false
      },
      '2021-06-01': {
        value: '$200',
        disabled: false
      },
      '2021-07-01': {
        value: '$200',
        disabled: false
      },
      '2021-08-01': {
        value: '--',
        disabled: true
      },
      '2021-09-01': {
        value: '--',
        disabled: true
      },
      '2021-10-01': {
        value: '--',
        disabled: true
      },
      '2021-11-01': {
        value: '--',
        disabled: true
      },
      '2021-12-01': {
        value: '--',
        disabled: true
      },
      '2022-01-01': {
        value: '--',
        disabled: true
      }
    },
    {
      name: { value: 'Engineering' },
      id: '26715779865003183',
      '2021-01-01': {
        value: '$200',
        disabled: false
      },
      '2021-02-01': {
        value: '$200',
        disabled: false
      },
      '2021-03-01': {
        value: '$200',
        disabled: false
      },
      '2021-04-01': {
        value: '$200',
        disabled: false
      },
      '2021-05-01': {
        value: '$200',
        disabled: false
      },
      '2021-06-01': {
        value: '$200',
        disabled: false
      },
      '2021-07-01': {
        value: '$200',
        disabled: false
      },
      '2021-08-01': {
        value: '--',
        disabled: true
      },
      '2021-09-01': {
        value: '--',
        disabled: true
      },
      '2021-10-01': {
        value: '--',
        disabled: true
      },
      '2021-11-01': {
        value: '--',
        disabled: true
      },
      '2021-12-01': {
        value: '--',
        disabled: true
      },
      '2022-01-01': {
        value: '--',
        disabled: true
      }
    },
    {
      name: { value: 'Another Budget' },
      id: '87641522069075013',
      '2021-01-01': {
        value: '$4000',
        disabled: false
      },
      '2021-02-01': {
        value: '--',
        disabled: true
      },
      '2021-03-01': {
        value: '--',
        disabled: true
      },
      '2021-04-01': {
        value: '--',
        disabled: true
      },
      '2021-05-01': {
        value: '--',
        disabled: true
      },
      '2021-06-01': {
        value: '--',
        disabled: true
      },
      '2021-07-01': {
        value: '--',
        disabled: true
      },
      '2021-08-01': {
        value: '--',
        disabled: true
      },
      '2021-09-01': {
        value: '--',
        disabled: true
      },
      '2021-10-01': {
        value: '--',
        disabled: true
      },
      '2021-11-01': {
        value: '--',
        disabled: true
      },
      '2021-12-01': {
        value: '--',
        disabled: true
      },
      '2022-01-01': {
        value: '--',
        disabled: true
      }
    },
    {
      name: { value: 'Fruit snacks' },
      id: '52506902055117528',
      '2021-01-01': {
        value: '$1000',
        disabled: true
      },
      '2021-02-01': {
        value: '$1000',
        disabled: true
      },
      '2021-03-01': {
        value: '$1000',
        disabled: true
      },
      '2021-04-01': {
        value: '$1000',
        disabled: true
      },
      '2021-05-01': {
        value: '$1000',
        disabled: true
      },
      '2021-06-01': {
        value: '$1000',
        disabled: true
      },
      '2021-07-01': {
        value: '$1000',
        disabled: true
      },
      '2021-08-01': {
        value: '$1000',
        disabled: true
      },
      '2021-09-01': {
        value: '$1000',
        disabled: true
      },
      '2021-10-01': {
        value: '$1000',
        disabled: true
      },
      '2021-11-01': {
        value: '$1000',
        disabled: true
      },
      '2021-12-01': {
        value: '--',
        disabled: true
      },
      '2022-01-01': {
        value: '--',
        disabled: true
      }
    },
    {
      name: { value: 'Fresh fruits' },
      id: '65227284566531957',
      '2021-01-01': {
        value: '$1000',
        disabled: false
      },
      '2021-02-01': {
        value: '$1000',
        disabled: false
      },
      '2021-03-01': {
        value: '$1000',
        disabled: false
      },
      '2021-04-01': {
        value: '$1000',
        disabled: false
      },
      '2021-05-01': {
        value: '$1000',
        disabled: false
      },
      '2021-06-01': {
        value: '$1000',
        disabled: false
      },
      '2021-07-01': {
        value: '$1000',
        disabled: false
      },
      '2021-08-01': {
        value: '$1000',
        disabled: false
      },
      '2021-09-01': {
        value: '$1000',
        disabled: false
      },
      '2021-10-01': {
        value: '$1000',
        disabled: false
      },
      '2021-11-01': {
        value: '$1000',
        disabled: false
      },
      '2021-12-01': {
        value: '--',
        disabled: true
      },
      '2022-01-01': {
        value: '--',
        disabled: true
      }
    },
    {
      name: { value: 'Lincoln Test 2' },
      id: '68024968889257378',
      '2021-01-01': {
        value: '$3000',
        disabled: false
      },
      '2021-02-01': {
        value: '$3000',
        disabled: false
      },
      '2021-03-01': {
        value: '$3000',
        disabled: false
      },
      '2021-04-01': {
        value: '$3000',
        disabled: false
      },
      '2021-05-01': {
        value: '$3000',
        disabled: false
      },
      '2021-06-01': {
        value: '$3000',
        disabled: false
      },
      '2021-07-01': {
        value: '$3000',
        disabled: false
      },
      '2021-08-01': {
        value: '$3000',
        disabled: false
      },
      '2021-09-01': {
        value: '$3000',
        disabled: false
      },
      '2021-10-01': {
        value: '$3000',
        disabled: false
      },
      '2021-11-01': {
        value: '$3000',
        disabled: false
      },
      '2021-12-01': {
        value: '$3000',
        disabled: false
      },
      '2022-01-01': {
        value: '$3000',
        disabled: false
      }
    }
    // {
    //     name: "Lincoln test 2 (socks)",
    //     id: "68025365469089224",
    //     '2021-01-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-02-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-03-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-04-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-05-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-06-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-07-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-08-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-09-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-10-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-11-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2021-12-01': {
    //         value: "$3000",
    //         disabled: false
    //     },
    //     '2022-01-01': {
    //         value: "$3000",
    //         disabled: false
    //     }
    // },
    // {
    //     name: "Jake's Budget",
    //     id: "67783645384952106",
    //     '2021-01-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-02-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-03-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-04-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-05-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-06-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-07-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-08-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-09-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-10-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-11-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2021-12-01': {
    //         value: "$5",
    //         disabled: false
    //     },
    //     '2022-01-01': {
    //         value: "$5",
    //         disabled: false
    //     }
    // },
    // {
    //     name: "Amanda's Budget",
    //     id: "68498530053932260",
    //     '2021-01-01': {
    //         value: "$2000",
    //         disabled: false
    //     },
    //     '2021-02-01': {
    //         value: "$2000",
    //         disabled: false
    //     },
    //     '2021-03-01': {
    //         value: "$2000",
    //         disabled: false
    //     },
    //     '2021-04-01': {
    //         value: "$2000",
    //         disabled: false
    //     },
    //     '2021-05-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-06-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-07-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-08-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-09-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-10-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-11-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2021-12-01': {
    //         value: "--",
    //         disabled: true
    //     },
    //     '2022-01-01': {
    //         value: "--",
    //         disabled: true
    //     }
    // }
  ];
}
