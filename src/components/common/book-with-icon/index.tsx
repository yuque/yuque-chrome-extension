import React from 'react';
import Icon from '@ant-design/icons';
import BookLogoSvg from '@/assets/svg/book-logo.svg';
import NoteLogoSvg from '@/assets/svg/note-logo.svg';
import { Book } from '@/core/interface';

interface IBookWithIconProps {
  book: Book;
}

function BookWithIcon(props: IBookWithIconProps) {
  const { book } = props;
  const iconSvg = book.type === 'Note' ? NoteLogoSvg : BookLogoSvg;
  return (
    <>
      <Icon style={{ marginRight: 4, color: '#262626' }} component={iconSvg} />
      {book.name}
    </>
  );
}

export default React.memo(BookWithIcon);
