import React from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-row-key': string;
}

const Row = (props: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
};

interface IDataSourceItem {
  id: number | string;
  [key: string]: any;
}

interface IDragListProps {
  dataSource: Array<IDataSourceItem>;
  onDragEnd?: (list: Array<any>) => void;
  renderItem: (item: IDataSourceItem) => React.ReactElement;
}

function DragList(props: IDragListProps) {
  const { dataSource } = props;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
        distance: 1,
      },
    }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = dataSource.findIndex(i => i.id === active.id);
      const overIndex = dataSource.findIndex(i => i.id === over?.id);
      const list = arrayMove(dataSource, activeIndex, overIndex);
      props.onDragEnd?.(list);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        // rowKey array
        items={dataSource.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {dataSource.map(item => {
          return (
            <Row data-row-key={`${item.id}`} key={item.id}>
              {props.renderItem(item)}
            </Row>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

export default DragList;
